import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@components/ui/select";
import { Card, CardContent } from "@components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@components/ui/alert-dialog";
import { cn, formats, modules, tinymceConfig } from "@lib/utils";
import type { QuestionGroup, FillBlanksGroup, TFNGGroup, MCQGroup, MultiGroup, MatchTableGroup, DragDropGroup, MatchingHeaderGroup } from "@shared/schemaAdmin";
import { Editor } from "@tinymce/tinymce-react";

interface QuestionGroupFormProps {
  group: QuestionGroup;
  onChange: (group: QuestionGroup) => void;
  onRemove: () => void;
  startNumber: number;
}

export default function QuestionGroupForm({ group, onChange, onRemove, startNumber }: QuestionGroupFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FILL_BLANKS": return "blue";
      case "TFNG": return "green";
      case "MCQ": return "purple";
      case "MULTI": return "orange";
      case "MATCH_TABLE": return "red";
      case "DRAG_DROP": return "indigo";
      case "MATCHING_HEADER": return "teal";
      default: return "gray";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "FILL_BLANKS": return "Fill Blanks";
      case "TFNG": return "True/False/Not Given";
      case "MCQ": return "Multiple Choice";
      case "MULTI": return "Multiple Select";
      case "MATCH_TABLE": return "Match Table";
      case "DRAG_DROP": return "Drag & Drop";
      case "MATCHING_HEADER": return "Matching Header";
      default: return type;
    }
  };

  const updateInstruction = (instruction: string) => {
    onChange({ ...group, instruction: instruction });
  };

  const addQuestion = () => {
    let newQuestion: any;

    if (group.type === "FILL_BLANKS") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "FILL_BLANKS",
        answer: [""],
      };
    } else if (group.type === "TFNG") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        question: "",
        answer: "NOT GIVEN",
      };
    } else if (group.type === "MCQ") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "MCQ",
        question: "",
        options: ["", "", "", ""],
        answer: "",
      };
    } else if (group.type === "MULTI") {
      // Tổng số đáp án đúng của các câu MULTI trước đó trong group này
      const prevMultiCount = group.questions.reduce(
        (sum, q) => sum + (Array.isArray(q.answer) ? q.answer.length : 1),
        0
      );
      newQuestion = {
        number: startNumber + prevMultiCount + 1,
        type: "MULTI",
        question: "",
        options: ["", "", "", ""],
        answer: [],
      };
    } else if (group.type === "MATCH_TABLE") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "MATCH_TABLE",
        question: "",
        answer: "",
      };
    } else if (group.type === "DRAG_DROP") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "DRAG_DROP",
        question: "",
        answer: "",
      };
    } else if (group.type === "MATCHING_HEADER") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "MATCHING_HEADER",
        question: "", // Không cần question text, chỉ cần number và answer
        answer: "",
      };
    } else if (group.type === "DROPDOWN") {
      newQuestion = {
        number: startNumber + group.questions.length + 1,
        type: "DROPDOWN",
        question: "",
        answer: "",
      };
    }

    onChange({
      ...group,
      questions: [...group.questions, newQuestion],
    });
  }

  const updateQuestion = (index: number, questionData: any) => {
    const updated = [...group.questions];
    // Đảm bảo chỉ cập nhật đúng trường cho từng loại group
    if (group.type === "FILL_BLANKS") {
      updated[index] = { ...updated[index], ...questionData, type: "FILL_BLANKS" };
      onChange({ ...group, questions: updated as { number: number; type: "FILL_BLANKS"; answer: string[]; }[] });
    } else if (group.type === "TFNG") {
      updated[index] = { ...updated[index], ...questionData };
      onChange({ ...group, questions: updated as { number: number; question: string; answer: "TRUE" | "FALSE" | "NOT GIVEN"; }[] });
    } else if (group.type === "MCQ") {
      updated[index] = { ...updated[index], ...questionData, type: "MCQ" };
      onChange({ ...group, questions: updated as { number: number; type: "MCQ"; question: string; options: string[]; answer: string; }[] });
    } else if (group.type === "MULTI") {
      updated[index] = { ...updated[index], ...questionData, type: "MULTI" };
      onChange({ ...group, questions: updated as { number: number; type: "MULTI"; question: string; options: string[]; answer: string[]; }[] });
    } else if (group.type === "MATCH_TABLE") {
      updated[index] = { ...updated[index], ...questionData, type: "MATCH_TABLE" };
      onChange({ ...group, questions: updated as { number: number; type: "MATCH_TABLE"; question: string; answer: string; }[] });
    } else if (group.type === "DRAG_DROP") {
      updated[index] = { ...updated[index], ...questionData, type: "DRAG_DROP" };
      onChange({ ...group, questions: updated as { number: number; type: "DRAG_DROP"; question: string; answer: string; }[] });
    } else if (group.type === "MATCHING_HEADER") {
      updated[index] = { ...updated[index], ...questionData, type: "MATCHING_HEADER" };
      onChange({ ...group, questions: updated as { number: number; type: "MATCHING_HEADER"; question: string; answer: string; }[] });
    } else if (group.type === "DROPDOWN") {
      updated[index] = { ...updated[index], ...questionData, type: "DROPDOWN" };
      onChange({ ...group, questions: updated as { number: number; type: "DROPDOWN"; question: string; options: string[]; answer: string; }[] });
    }
  };

  const removeQuestion = (index: number) => {
    const filtered = group.questions.filter((_, i) => i !== index);
    if (group.type === "FILL_BLANKS") {
      onChange({ ...group, questions: filtered as { number: number; type: "FILL_BLANKS"; answer: string[]; }[] });
    } else if (group.type === "TFNG") {
      onChange({ ...group, questions: filtered as { number: number; question: string; answer: "TRUE" | "FALSE" | "NOT GIVEN"; }[] });
    } else if (group.type === "MCQ") {
      onChange({ ...group, questions: filtered as { number: number; type: "MCQ"; question: string; options: string[]; answer: string; }[] });
    } else if (group.type === "MULTI") {
      onChange({ ...group, questions: filtered as { number: number; type: "MULTI"; question: string; options: string[]; answer: string[]; }[] });
    } else if (group.type === "MATCH_TABLE") {
      onChange({ ...group, questions: filtered as { number: number; type: "MATCH_TABLE"; question: string; answer: string; }[] });
    } else if (group.type === "DRAG_DROP") {
      onChange({ ...group, questions: filtered as { number: number; type: "DRAG_DROP"; question: string; answer: string; }[] });
    } else if (group.type === "MATCHING_HEADER") {
      onChange({ ...group, questions: filtered as { number: number; type: "MATCHING_HEADER"; question: string; answer: string; }[] });
    }
  };

  const color = getTypeColor(group.type);

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className={cn("px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={cn("question-type-badge", group.type.toLowerCase().replace("_", "-"))}>
              {group.type}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {getTypeName(group.type)} - {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete this question group"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this {getTypeName(group.type)} question group?
                    This will remove all {group.questions.length} question{group.questions.length !== 1 ? 's' : ''} in this group.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <Editor

              tinymceScriptSrc="../../../tinymce/tinymce.min.js"
              value={group.instruction}
              onEditorChange={(content: string) => updateInstruction(content)}
              init={tinymceConfig.init}
              textareaName="instruction"
              className="bg-white"
            />
          </div>

          {/* Fill Blanks specific fields */}
          {group.type === "FILL_BLANKS" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image/Graph (optional)
              </label>
              <Editor
                tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                value={(group as any).imgContent || ""}
                onEditorChange={(content: string) =>
                  onChange({ ...group, imgContent: content })
                }
                init={tinymceConfig.init}
                textareaName="image"
                className="bg-white min-h-[80px] mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Paragraph
              </label>
              <Editor
                tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                value={(group as FillBlanksGroup).paragraph || ""}
                onEditorChange={(content: string) =>
                  onChange({ ...group, paragraph: content } as FillBlanksGroup)
                }
                init={tinymceConfig.init}
                textareaName="paragraph"
                className="bg-white min-h-[120px]"
              />
            </div>
          )}

          {group.type === "DROPDOWN" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paragraph (optional)
              </label>
              <Editor
                tinymceScriptSrc="../../../tinymce/tinymce.min.js"

                value={(group as any).paragraph || ""}
                onEditorChange={(content: string) =>
                  onChange({ ...group, paragraph: content })
                }
                init={tinymceConfig.init}
                textareaName="paragraph"
                className="bg-white min-h-[120px]"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (applies to all questions)
                </label>
                <div className="space-y-2">
                  {(group.choices || ["", "", "", ""]).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3">
                      <Input
                        value={option}
                        onChange={e => {
                          const choices = [...(group.choices || [])];
                          choices[optionIndex] = e.target.value;
                          onChange({ ...group, choices });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          const choices = [...(group.choices || [])];
                          choices.splice(optionIndex, 1);
                          onChange({ ...group, choices });
                        }}
                        disabled={(group.choices || []).length <= 2}
                        title="Remove option"
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const choices = [...(group.choices || [])];
                      choices.push("");
                      onChange({ ...group, choices });
                    }}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Option
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Match Table and Drag Drop specific fields */}
          {(group.type === "MATCH_TABLE" || group.type === "DRAG_DROP" || group.type === "MATCHING_HEADER") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image/Graph (optional)
              </label>
              <Editor
                tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                value={(group as any).imgContent || (group as any).paragraph}
                onEditorChange={(content: string) =>
                  onChange({ ...group, imgContent: content })
                }
                init={tinymceConfig.init}
                textareaName="image"
                className="bg-white min-h-[80px] mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Choices</label>
              <div className="space-y-2">
                {((group as MatchTableGroup | DragDropGroup | MatchingHeaderGroup).choices || []).map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const choices = [...((group as MatchTableGroup | DragDropGroup | MatchingHeaderGroup).choices || [])];
                        choices[index] = e.target.value;
                        onChange({ ...group, choices });
                      }}
                      placeholder={`Choice ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const choices = ((group as MatchTableGroup | DragDropGroup | MatchingHeaderGroup).choices || []).filter((_, i) => i !== index);
                        onChange({ ...group, choices });
                      }}
                      className="text-red-600"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { 
                    const newChoice = `Choice ${(group.choices?.length || 0) + 1}`;
                    const choices = [
                      ...((group as MatchTableGroup | DragDropGroup | MatchingHeaderGroup).choices || []),
                      // For MATCHING_HEADER, this will be an empty input, which is fine.
                      newChoice
                    ];
                    onChange({ ...group, choices });
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Choice
                </Button>
              </div>
            </div>
          )}

          {/* Drag Drop paragraph */}
          {(group.type === "DRAG_DROP") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paragraph with Blanks
              </label>
              <Editor
                tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                value={(group as DragDropGroup | MatchingHeaderGroup).paragraph || ""}
                onEditorChange={(content: string) =>
                  onChange({
                    ...group,
                    paragraph: content,
                  } as DragDropGroup | MatchingHeaderGroup)
                }
                init={tinymceConfig.init}
                textareaName="paragraph"
                className="bg-white min-h-[120px]"
              />
            </div>
          )}

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Questions</h4>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <i className="fas fa-plus mr-2"></i>
                Add Question
              </Button>
            </div>

            {group.questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Question {question.number}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete Question {question.number}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeQuestion(index)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Question
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* TFNG Questions */}
                  {group.type === "TFNG" && (
                    <div className="space-y-3">
                      <Textarea
                        value={(question as any).question || ""}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        rows={2}
                        placeholder="Question statement"
                      />
                      <div className="flex items-center space-x-4">
                        <label className="text-sm">Answer:</label>
                        <Select
                          value={(question as any).answer || "NOT GIVEN"}
                          onValueChange={(value) => updateQuestion(index, { answer: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRUE">TRUE</SelectItem>
                            <SelectItem value="FALSE">FALSE</SelectItem>
                            <SelectItem value="NOT GIVEN">NOT GIVEN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* MCQ Questions */}
                  {group.type === "MCQ" && (
                    <div className="space-y-3">
                      <Textarea
                        value={(question as any).question || ""}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        rows={2}
                        placeholder="Question text"
                      />
                      <div className="space-y-2">
                        {((question as any).options || ["", "", "", ""]).map((option: string, optionIndex: number) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name={`q${index}_answer`}
                              checked={(question as any).answer === option}
                              onChange={() => updateQuestion(index, { answer: option })}
                            />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const options = [...((question as any).options || [])];
                                options[optionIndex] = e.target.value;
                                updateQuestion(index, { options });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                const options = [...((question as any).options || [])];
                                options.splice(optionIndex, 1);
                                updateQuestion(index, { options });
                              }}
                              disabled={((question as any).options || []).length <= 2}
                              title="Remove option"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const options = [...((question as any).options || [])];
                            options.push("");
                            updateQuestion(index, { options });
                          }}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {group.type === "DROPDOWN" && (
                    <div>
                      <Textarea
                        value={(question as any).question || ""}
                        onChange={e => updateQuestion(index, { question: e.target.value })}
                        rows={2}
                        placeholder="Question text"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                        <select
                          className="border rounded px-3 py-2"
                          value={question.answer || ""}
                          onChange={e => updateQuestion(index, { answer: e.target.value })}
                        >
                          <option value="" disabled>Select answer</option>
                          {(group.choices || []).map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>{option || `Option ${String.fromCharCode(65 + optionIndex)}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* MULTI Questions */}
                  {group.type === "MULTI" && (
                    <div className="space-y-3">
                      <Textarea
                        value={(question as any).question || ""}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        rows={2}
                        placeholder="Question text"
                      />
                      <div className="space-y-2">
                        {((question as any).options || ["", "", "", ""]).map((option: string, optionIndex: number) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={((question as any).answer || []).includes(option)}
                              onChange={(e) => {
                                const currentAnswers = (question as any).answer || [];
                                const newAnswers = e.target.checked
                                  ? [...currentAnswers, option]
                                  : currentAnswers.filter((a: string) => a !== option);
                                updateQuestion(index, { answer: newAnswers });
                              }}
                            />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const options = [...((question as any).options || [])];
                                options[optionIndex] = e.target.value;
                                updateQuestion(index, { options });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                const options = [...((question as any).options || [])];
                                options.splice(optionIndex, 1);
                                updateQuestion(index, { options });
                              }}
                              disabled={((question as any).options || []).length <= 2}
                              title="Remove option"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const options = [...((question as any).options || [])];
                            options.push("");
                            updateQuestion(index, { options });
                          }}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Fill Blanks Questions */}
                  {group.type === "FILL_BLANKS" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Accepted Answers</label>
                      {((question as any).answer || [""]).map((ans: string, ansIndex: number) => (
                        <div key={ansIndex} className="flex items-center space-x-2">
                          <Input
                            value={ans}
                            onChange={(e) => {
                              const newAnswers = [...(question as any).answer];
                              newAnswers[ansIndex] = e.target.value;
                              updateQuestion(index, { answer: newAnswers });
                            }}
                            placeholder={`Answer ${ansIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              const newAnswers = ((question as any).answer || []).filter((_: any, i: number) => i !== ansIndex);
                              updateQuestion(index, { answer: newAnswers });
                            }}
                            disabled={((question as any).answer || []).length <= 1}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newAnswers = [...((question as any).answer || []), ""];
                          updateQuestion(index, { answer: newAnswers });
                        }}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add Answer
                      </Button>
                    </div>
                  )}

                  {/* Match Table Questions */}
                  {group.type === "MATCH_TABLE" && (
                    <div className="space-y-3">
                      <Textarea
                        value={(question as any).question || ""}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        rows={2}
                        placeholder="Question statement"
                      />
                      <div className="flex items-center space-x-4">
                        <label className="text-sm">Answer:</label>
                        <Select
                          value={(question as any).answer || ""}
                          onValueChange={(value) => updateQuestion(index, { answer: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {((group as MatchTableGroup).choices || []).map((choice, choiceIndex) => (
                              <SelectItem key={choiceIndex} value={choice || `choice-${choiceIndex}`}>
                                {choice || `Choice ${choiceIndex + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Drag Drop Questions */}
                  {(group.type === "DRAG_DROP" || group.type === "MATCHING_HEADER") && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm">Answer:</label>
                        <Select
                          value={(question as any).answer || ""}
                          onValueChange={(value) => updateQuestion(index, { answer: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent> 
                            {((group as DragDropGroup | MatchingHeaderGroup).choices || []).filter(choice => choice.trim() !== "").map((choice, choiceIndex) => (
                              <SelectItem key={choiceIndex} value={choice}>
                                {choice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
