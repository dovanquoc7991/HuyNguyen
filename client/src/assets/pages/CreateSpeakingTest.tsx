import { useMutation, useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter"; // hoặc react-router-dom
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@hooks/use-toast";
import { api } from "../lib/api";
import { Editor } from "@tinymce/tinymce-react";
import { queryClient } from "../lib/queryClient";
import { useEffect } from "react";
import { Test } from "@shared/schemaAdmin"; // giống writing
import { tinymceConfig } from "../lib/utils";

const speakingFormSchema = z.object({
  title: z.string().min(1, "Test name is required"),
  part_number: z.number().min(1).max(4),
  examContent: z.string().min(1, "Content is required"),
  audio_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

type SpeakingFormData = z.infer<typeof speakingFormSchema>;

export default function CreateSpeakingTest() {
  const [, params] = useRoute("/admin/create-speaking-test/:id");
  const examId = params?.id ? parseInt(params.id) : null;
  const isEditing = !!examId;

  const { toast } = useToast();

  const form = useForm<SpeakingFormData>({
    resolver: zodResolver(speakingFormSchema),
    defaultValues: {
      title: "",
      part_number: 1,
      examContent: "",
      audio_url: "",
    },
    shouldUnregister: false,
  });

  // Query fetch khi edit
  const { data: examData, isLoading: isLoadingTest } = useQuery<Test>({
    queryKey: ["/api/tests", examId],
    queryFn: () => api.getReadingWritingDetail(examId!), // <-- cần API getSpeakingDetail
    enabled: isEditing,
  });

  useEffect(() => {
    if (examData) {
      form.reset({
        title: examData.title || "",
        part_number: examData.part_number || 1,
        examContent: examData.examContent || "",
        audio_url: examData.audio_url || "",
      });
    }
  }, [examData, form]);

  // Mutation Create
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createSpeakingTest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Speaking"] });
      toast({
        title: "Success",
        description: "Speaking test created successfully",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create speaking test",
        variant: "destructive",
      });
    },
  });

  // Mutation Update
  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.updateTest(examId!, 'speaking', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-list-by-type", "Speaking"] });
      toast({
        title: "Updated",
        description: "Speaking test updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update speaking test",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SpeakingFormData) => {
    if (examId) {
      // Khi update, gửi thẳng object section
      const payload = {
        title: data.title,
        part_number: data.part_number,
        examContent: data.examContent,
        audio_url: data.audio_url,
      };
      updateMutation.mutate(payload);
    } else {
      // Khi create, gửi object có description và mảng speaking
      const payload = { description: data.title, speaking: [{ ...data }] };
      createMutation.mutate(payload);
    }
  };

  // Validation
  const isTitle = !!form.watch("title");
  const isContent = !!form.watch("examContent");

  return (
    <>

      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {examId ? "Edit IELTS Speaking Test" : "Create New IELTS Speaking Test"}
          </h2>
          <p className="text-gray-600 mt-1">
            {examId ? "Modify the existing IELTS speaking test" : "Design and configure your IELTS speaking test"}
          </p>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle text-blue-600 mr-3"></i>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingTest && examId ? (
                  <p>Loading exam data...</p>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium mb-1">Part Number</label>
                          <Select
                            value={form.watch("part_number")?.toString()}
                            onValueChange={(value) => form.setValue("part_number", Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select part" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Part 1</SelectItem>
                              <SelectItem value="2">Part 2</SelectItem>
                              <SelectItem value="3">Part 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Test Name</label>
                        <Input
                          type="text"
                          {...form.register("title")}
                          placeholder="Enter a title..."
                          required
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="audio_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://example.com/audio.mp3"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("audio_url") && (
                        <div className="mt-2">
                          <audio
                            controls
                            src={form.watch("audio_url")}
                            className="w-full"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block font-medium mb-1">Speaking Content</label>
                        <Editor
                          tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                          value={form.watch("examContent")}
                          onEditorChange={(value: string) => form.setValue("examContent", value)}
                          init={tinymceConfig.init}
                        />
                      </div>

                      <Button
                        type="submit"
                        className={`${examId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                          } text-white font-semibold px-6 py-2 rounded transition`}
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {examId ? "Update Test" : "Publish Test"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${isTitle ? "check-circle text-green-500" : "times-circle text-red-500"}`}></i>
                  <span className="text-sm text-gray-700">Title provided</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${isContent ? "check-circle text-green-500" : "times-circle text-red-500"}`}></i>
                  <span className="text-sm text-gray-700">Content provided</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
