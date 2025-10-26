import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QuestionGroupForm from "@components/question-group-form";
import JsonPreviewModal from "@components/json-preview-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Checkbox } from "@components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useToast } from "@hooks/use-toast";
import { apiRequest, queryClient } from "@lib/queryClient";
import { generateTestJSON } from "@lib/test-utils";
import type { Test, QuestionGroup } from "@shared/schemaAdmin";
import { api } from "../lib/api";
import { Editor } from '@tinymce/tinymce-react';
import { tinymceConfig } from "../lib/utils";
import { is } from "drizzle-orm";

const testFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  explanation: z.string().optional(),
  time: z.number().min(1, "Time must be at least 1 minute"),
  test_type: z.enum(["single_part", "full_test"]),
  part_number: z.number().min(1).max(3).optional(),
  passage: z.array(z.string()).min(1, "At least one passage paragraph is required"),
  start_question_number: z.number().min(1, "Start question number must be at least 1").default(1),
  locked: z.boolean().default(false),
  testLevel: z.enum(["normal", "basic"]).default("normal"),
  password: z.string().optional(),
}).refine(data => {
  if (data.locked && (!data.password || data.password.length < 4)) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 4 characters long when the test is locked.",
  path: ["password"],
});

type TestFormData = z.infer<typeof testFormSchema>;

export default function CreateTest() {
  const [, params] = useRoute("/admin/create-reading-test/:id");
  const testId = params?.id ? parseInt(params.id) : null;
  const isEditing = testId !== null;

  const { toast } = useToast();
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [formKey, setFormKey] = useState(0); // Thêm state để làm mới key
  const [passageText, setPassageText] = useState("");
  const [currentPart, setCurrentPart] = useState(1);
  const [parts, setParts] = useState<{
    [key: number]: {
      passage: string;
      groups: QuestionGroup[];
    }
  }>({
    1: { passage: "", groups: [] },
    2: { passage: "", groups: [] },
    3: { passage: "", groups: [] }
  });

  const form = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      explanation: "",
      time: 20,
      test_type: "single_part",
      part_number: 1,
      passage: [""],
      start_question_number: 1,
      locked: false,
      testLevel: "normal",
      password: "",
    },
  });

  // Load existing test if editing
  const { data: existingTest, isLoading: isLoadingTest } = useQuery<Test>({
    queryKey: ["/api/tests", testId],
    queryFn: () => api.getReadingPartDetail(testId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingTest) {
      console.log("Loaded existing test:", existingTest);
      form.reset({
        title: existingTest.title || "",
        explanation: existingTest.explanation || "",
        time: Number(existingTest.time) || 20, // Đảm bảo time là một số
        test_type: "single_part",
        part_number: existingTest.part_number || 1,
        passage: Array.isArray(existingTest.passage)
          ? existingTest.passage
          : [typeof existingTest.passage === "string" ? existingTest.passage : ""],
        start_question_number: 1,
        locked: !!existingTest.locked, // Đảm bảo locked là một boolean
        testLevel: existingTest.isBasic ? "basic" : "normal",
        password: existingTest.password || "",
      });

      setPassageText(
        Array.isArray(existingTest.passage)
          ? existingTest.passage.join("\n\n")
          : typeof existingTest.passage === "string"
            ? existingTest.passage
            : ""
      );

      // Tạo một bản sao sâu (deep copy) để đảm bảo các component con nhận được prop mới và render lại
      if (Array.isArray(existingTest.groups)) {
        // --- GIẢI PHÁP: Chuyển đổi dữ liệu trước khi set state ---
        // Vấn đề gốc rễ là cấu trúc dữ liệu từ API (existingTest) có thể không
        // khớp 100% với cấu trúc mà component QuestionGroupForm mong đợi.
        // Ví dụ: API có thể trả về `answers: ["Đáp án A"]` (một mảng),
        // nhưng form bên trong lại cần một trường tên là `answer: "Đáp án A"` (một chuỗi).
        // Ta cần chuyển đổi (map) dữ liệu cho đúng.
        const transformedGroups = existingTest.groups.map(group => ({
          ...group,
          questions: group.questions.map((q: { answers: any[] }) => {
            let newAnswer;
            const apiAnswers = q.answers;

            // Tùy thuộc vào loại câu hỏi, trường 'answer' phải là một chuỗi hoặc một mảng.
            // Chúng ta chuyển đổi mảng `answers` thô từ API sang định dạng chính xác.
            switch (group.type) {
              case "TFNG":
              case "MCQ":
              case "MATCH_TABLE":
              case "DRAG_DROP":
              case "MATCHING_HEADER":
              case "DROPDOWN":
                // Các loại này mong đợi một câu trả lời chuỗi duy nhất.
                newAnswer = Array.isArray(apiAnswers) ? apiAnswers[0] || "" : "";
                break;
              case "MULTI":
              case "FILL_BLANKS":
                // Các loại này mong đợi một mảng câu trả lời.
                newAnswer = Array.isArray(apiAnswers) ? apiAnswers : [];
                break;
              default:
                newAnswer = Array.isArray(apiAnswers) ? apiAnswers : [];
            }
            return { ...q, answer: newAnswer };
          })
        }));

        setQuestionGroups(transformedGroups);
        setFormKey(prevKey => prevKey + 1); // Thay đổi key để buộc re-mount
      }
    }
  }, [existingTest, form]);

  const createTestMutation = useMutation({
    mutationFn: (data: TestFormData & { groups: QuestionGroup[] }) => {
      if (data.test_type === "full_test") {
        const payload = {
          description: data.title,
          reading: Object.values(parts).map((part, idx) => ({
            title: data.title,
            explanation: data.explanation,
            time: data.time,
            passage: part.passage,
            groups: part.groups,
            part_number: idx + 1,
            locked: data.locked,
            password: data.password,
          })),
        };
        return api.createFullTest(payload);
      } else {
        const payload = {
          description: data.title,
          reading: [
            {
              title: data.title,
              time: data.time,
              explanation: data.explanation,
              passage: passageText,
              groups: questionGroups,
              part_number: data.part_number,
              locked: data.locked,
              isBasic: data.testLevel === 'basic',
              password: data.password,
            },
          ],
        };
        return api.createReadingTest(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Reading"] });
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Listening"] });
      toast({
        title: "Success",
        description: "Test created successfully",
      });
      form.reset();
      setQuestionGroups([]);
      setPassageText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create test",
        variant: "destructive",
      });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: (data: TestFormData & { groups: QuestionGroup[] }) => {
      if (!testId) {
        // Dòng này sẽ khiến mutation thất bại và kích hoạt onError
        return Promise.reject(new Error("Cannot update test: Section ID not found."));
      }


      const payload = {
        title: data.title,
        time: String(data.time),
        passage: passageText,
        groups: questionGroups,
        part_number: data.part_number,
        locked: data.locked,
        isBasic: data.testLevel === 'basic',
        password: data.password,
        explanation: data.explanation,
      };
      console.log(payload);
      return api.updateReadingPart(testId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Reading"] });
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Listening"] });
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update test:", error);
      toast({
        title: "Error",
        description: "Failed to update test",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TestFormData) => {
    const passage = passageText.split("\n\n").filter(p => p.trim());
    const testData = {
      ...data,
      passage,
      groups: questionGroups,
    };
    if (isEditing) {
      updateTestMutation.mutate(testData);
    } else {
      createTestMutation.mutate(testData);
    }
  };

  const addQuestionGroup = (type: QuestionGroup["type"]) => {
    const newGroup: QuestionGroup = {
      type,
      instruction: "",
      questions: [],
    } as QuestionGroup;

    if (form.watch("test_type") === "full_test") {
      setParts(prev => ({
        ...prev,
        [currentPart]: {
          ...prev[currentPart],
          groups: [...prev[currentPart].groups, newGroup]
        }
      }));
    } else {
      setQuestionGroups([...questionGroups, newGroup]);
    }
  };

  const updateQuestionGroup = (index: number, group: QuestionGroup) => {
    const updated = [...questionGroups];
    updated[index] = group;
    setQuestionGroups(updated);
  };

  const removeQuestionGroup = (index: number) => {
    setQuestionGroups(questionGroups.filter((_, i) => i !== index));
  };

  const totalQuestions = questionGroups.reduce((sum, group) => sum + group.questions.length, 0);
  const wordCount = form.watch("test_type") === "full_test"
    ? Object.values(parts).reduce((sum, part) => {
      const partText = part?.passage || "";
      const partWordCount = partText.trim() ? partText.trim().split(/\s+/).length : 0;
      return sum + partWordCount;
    }, 0)
    : (passageText || "").trim() ? (passageText || "").trim().split(/\s+/).length : 0;

  const readyToPublish =
    !!form.watch("title") &&
    (
      form.watch("test_type") === "full_test"
        ? Object.values(parts).some(
          part =>
            (part?.passage || "").trim() &&
            (part?.groups || []).length > 0 &&
            (part?.groups || []).some(group => (group?.questions || []).length > 0)
        )
        : (passageText || "").trim() && questionGroups.length > 0 && totalQuestions > 0
    );

  if (isEditing && isLoadingTest) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-lg text-gray-600">Loading test data...</span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Test" : "Create New IELTS Reading Test"}
            </h2>
            <p className="text-gray-600 mt-1">
              Design and configure your IELTS reading test with multiple question types
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              form="test-form"
              disabled={createTestMutation.isPending || updateTestMutation.isPending || !readyToPublish}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-check mr-2"></i>
              {isEditing ? "Update Test" : "Publish Test"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <Form {...form}>
              <form id="test-form" onSubmit={form.handleSubmit(onSubmit)}>
                {/* Basic Information */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-info-circle text-blue-600 mr-3"></i>
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {form.watch("test_type") === "single_part" && (
                        <FormField
                          control={form.control}
                          name="part_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Part Number</FormLabel>
                              <FormControl>
                                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select part" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Part 1</SelectItem>
                                    <SelectItem value="2">Part 2</SelectItem>
                                    <SelectItem value="3">Part 3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reading Time (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="start_question_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Question Number</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="explanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation</FormLabel>
                          <FormControl>
                            <Editor
                              tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                              value={field.value}
                              onEditorChange={field.onChange}
                              init={tinymceConfig.init}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="locked"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Lock this test with a password
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("locked") && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password (min. 4 characters)" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Passage Content */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-file-text text-blue-600 mr-3"></i>
                      Passage Content
                      {form.watch("test_type") === "full_test" && (
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          - Part {currentPart}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.watch("test_type") === "full_test" && (
                      <div className="mb-4">
                        <div className="flex space-x-2 border-b border-gray-200">
                          {[1, 2, 3].map((part) => (
                            <button
                              key={part}
                              type="button"
                              onClick={() => setCurrentPart(part)}
                              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${currentPart === part
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                              Part {part}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <Editor
                        tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                        value={
                          form.watch("test_type") === "full_test"
                            ? parts[currentPart].passage
                            : passageText
                        }
                        onEditorChange={(content: string) => {
                          if (form.watch("test_type") === "full_test") {
                            setParts(prev => ({
                              ...prev,
                              [currentPart]: { ...prev[currentPart], passage: content }
                            }));
                          } else {
                            setPassageText(content);
                          }
                        }}
                        init={tinymceConfig.init}

                      />
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        {(() => {
                          const currentText = form.watch("test_type") === "full_test"
                            ? (parts[currentPart]?.passage || "")
                            : (passageText || "");
                          const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
                          return (
                            <>
                              <span>Word count: {wordCount}</span>
                              <span>Character count: {currentText.length.toLocaleString()}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <i className="fas fa-question-circle text-blue-600 mr-3"></i>
                    Questions ({
                      form.watch("test_type") === "full_test"
                        ? (parts[currentPart]?.groups || []).reduce((sum, group) => sum + (group?.questions || []).length, 0)
                        : totalQuestions
                    })
                    {form.watch("test_type") === "full_test" && (
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        - Part {currentPart}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(form.watch("test_type") === "full_test" ? (parts[currentPart]?.groups || []) : questionGroups).map((group, index, arr) => {
                    const getUsedQuestionNumbers = (groups: any[]) =>
                      groups.reduce((sum, group) => {
                        if (group.type === "MULTI") {
                          return sum + (group.questions?.reduce((s: number, q: any) => s + (Array.isArray(q.answer) ? q.answer.length : 1), 0) || 0);
                        }
                        return sum + (group.questions?.length || 0);
                      }, 0);

                    const startNumber = form.watch("start_question_number") + getUsedQuestionNumbers(arr.slice(0, index)) - 1;

                    return (
                      <QuestionGroupForm
                        key={`${formKey}-${index}`} // Sử dụng key mới
                        group={group}
                        onChange={(updatedGroup) => {
                          if (form.watch("test_type") === "full_test") {
                            setParts(prev => ({
                              ...prev,
                              [currentPart]: {
                                ...prev[currentPart],
                                groups: (prev[currentPart]?.groups || []).map((g, i) => i === index ? updatedGroup : g)
                              }
                            }));
                          } else {
                            updateQuestionGroup(index, updatedGroup);
                          }
                        }}
                        onRemove={() => {
                          if (form.watch("test_type") === "full_test") {
                            setParts(prev => ({
                              ...prev,
                              [currentPart]: {
                                ...prev[currentPart],
                                groups: (prev[currentPart]?.groups || []).filter((_, i) => i !== index)
                              }
                            }));
                          } else {
                            removeQuestionGroup(index);
                          }
                        }}
                        startNumber={startNumber}
                      />
                    );
                  })}

                  {/* Add Question Group */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <i className="fas fa-plus-circle text-3xl text-gray-400"></i>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Add Question Group</h4>
                    <p className="text-gray-600 mb-4">Choose a question type to add to your test</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("FILL_BLANKS")}
                      >
                        <i className="fas fa-edit text-blue-500 mb-2"></i>
                        <div className="font-medium">Fill Blanks</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("TFNG")}
                      >
                        <i className="fas fa-check-circle text-green-500 mb-2"></i>
                        <div className="font-medium">True/False/NG</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("MCQ")}
                      >
                        <i className="fas fa-list text-purple-500 mb-2"></i>
                        <div className="font-medium">Multiple Choice</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("MULTI")}
                      >
                        <i className="fas fa-check-double text-orange-500 mb-2"></i>
                        <div className="font-medium">Multiple Select</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("MATCH_TABLE")}
                      >
                        <i className="fas fa-table text-red-500 mb-2"></i>
                        <div className="font-medium">Match Table</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("DRAG_DROP")}
                      >
                        <i className="fas fa-hand-rock text-indigo-500 mb-2"></i>
                        <div className="font-medium">Drag & Drop</div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="p-3 h-auto flex-col"
                        onClick={() => addQuestionGroup("MATCHING_HEADER")}
                      >
                        <i className="fas fa-heading text-teal-500 mb-2"></i>
                        <div className="font-medium">Matching Header</div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats and Tools */}
          <div className="space-y-6">
            {/* Test Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Test Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="font-semibold text-gray-900">
                    {form.watch("test_type") === "full_test"
                      ? Object.values(parts).reduce((sum, part) => sum + (part?.groups || []).reduce((partSum, group) => partSum + (group?.questions || []).length, 0), 0)
                      : totalQuestions
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Question Groups</span>
                  <span className="font-semibold text-gray-900">
                    {form.watch("test_type") === "full_test"
                      ? Object.values(parts).reduce((sum, part) => sum + (part?.groups || []).length, 0)
                      : questionGroups.length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reading Time</span>
                  <span className="font-semibold text-gray-900">{form.watch("time")} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Word Count</span>
                  <span className="font-semibold text-gray-900">{wordCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${form.watch("title") ? "check-circle text-green-500" : "times-circle text-red-500"}`}></i>
                  <span className="text-sm text-gray-700">Title provided</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${form.watch("test_type") === "full_test"
                    ? Object.values(parts).some(part => (part?.passage || "").trim()) ? "check-circle text-green-500" : "times-circle text-red-500"
                    : (passageText || "").trim() ? "check-circle text-green-500" : "times-circle text-red-500"
                    }`}></i>
                  <span className="text-sm text-gray-700">Passage content added</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${form.watch("test_type") === "full_test"
                    ? Object.values(parts).some(part => (part?.groups || []).length > 0) ? "check-circle text-green-500" : "times-circle text-red-500"
                    : questionGroups.length > 0 ? "check-circle text-green-500" : "times-circle text-red-500"
                    }`}></i>
                  <span className="text-sm text-gray-700">Questions configured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${form.watch("test_type") === "full_test"
                    ? Object.values(parts).some(part => (part?.groups || []).some(group => (group?.questions || []).length > 0)) ? "check-circle text-green-500" : "times-circle text-red-500"
                    : totalQuestions > 0 ? "check-circle text-green-500" : "times-circle text-red-500"
                    }`}></i>
                  <span className="text-sm text-gray-700">Has questions</span>
                </div>

                {form.watch("title") &&
                  (form.watch("test_type") === "full_test"
                    ? Object.values(parts).some(part => (part?.passage || "").trim() && (part?.groups || []).length > 0 && (part?.groups || []).some(group => (group?.questions || []).length > 0))
                    : (passageText || "").trim() && questionGroups.length > 0 && totalQuestions > 0
                  ) && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Ready to publish</span>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* JSON Preview Modal */}
      <JsonPreviewModal
        isOpen={showJsonPreview}
        onClose={() => setShowJsonPreview(false)}
        testData={generateTestJSON(
          form.getValues(),
          passageText,
          questionGroups,
          form.watch("test_type") === "full_test"
            ? Object.fromEntries(
              Object.entries(parts).map(([k, v]) => [
                k,
                { ...v, passage: v.passage }
              ])
            )
            : undefined
        )}
      />
    </>
  );
}