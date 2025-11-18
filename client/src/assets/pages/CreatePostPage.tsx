import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useForm } from "react-hook-form";
import { useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@hooks/use-toast";
import { api } from "../lib/api";
import { Editor } from "@tinymce/tinymce-react";
import { queryClient } from "../lib/queryClient";
import { tinymceConfig } from "../lib/utils";import { useEffect } from "react";

const postFormSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  type: z.enum(["reading", "listening"], { required_error: "Post type is required" }),
  content: z.string().min(1, "Content is required"),
  audio_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

type PostFormData = z.infer<typeof postFormSchema>;

export default function CreatePostPage() {
  const [, params] = useRoute("/admin/create-stories/:id");
  const postId = params?.id ? parseInt(params.id) : null;
  const isEditing = !!postId;
  const { toast } = useToast();


  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      type: "reading",
      content: "",
      audio_url: "",
    },
  });

  // Query để fetch dữ liệu khi ở chế độ edit
  const { data: postData, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => api.getPostDetail(postId!), // Giả định có hàm api.getPostDetail
    enabled: isEditing,
  });

  // Cập nhật form với dữ liệu đã fetch
  useEffect(() => {
    console.log(postData);
    if (postData) {
      console.log(postData);
      // Đảm bảo các trường khớp với schema và xử lý giá trị null
      const formData = {
        title: postData.title || "",
        type: postData.type || "reading",
        content: postData.content || "",
        audio_url: postData.audio_url || "",
      };
      form.reset(formData);
    }
  }, [postData, form]);

  // Mutation để tạo mới
  const createPostMutation = useMutation({
    mutationFn: (payload: PostFormData) => api.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Story created successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create story",
        variant: "destructive",
      });
    },
  });

  // Mutation để cập nhật
  const updatePostMutation = useMutation({
    mutationFn: (payload: PostFormData) => api.updatePost(postId!, payload), // Giả định có hàm api.updatePost
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast({
        title: "Success",
        description: "Story updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update story",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    if (isEditing) {
      updatePostMutation.mutate(data);
    } else {
      console.log(data);
      createPostMutation.mutate(data);
    }
  };

  const isTitle = !!form.watch("title");
  const isContent = !!form.watch("content");

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Post" : "Create New Stories"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modify the existing story." : "Create a new Reading or Listening stories."}
          </p>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle text-blue-600 mr-3"></i>
                  Stories Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPost && isEditing ? (
                  <p>Loading stories data...</p>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-1">Story Title</label>
                          <Input
                            type="text"
                            {...form.register("title")}
                            placeholder="Enter a title for the story..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Story Type</label>
                          <Select
                            value={form.watch("type")}
                            onValueChange={(value: "reading" | "listening") => form.setValue("type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reading">Reading</SelectItem>
                              <SelectItem value="listening">Listening</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          <audio controls src={form.watch("audio_url")} className="w-full" />
                        </div>
                      )}

                      <div>
                        <label className="block font-medium mb-1">Story Content</label>
                        <Editor
                          tinymceScriptSrc="../../../tinymce/tinymce.min.js"
                          value={form.watch("content")}
                          onEditorChange={(value: string) => form.setValue("content", value)}
                          init={tinymceConfig.init}
                        />
                      </div>

                      <Button type="submit" className={`${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white font-semibold px-6 py-2 rounded transition`} disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                        {isEditing ? (updatePostMutation.isPending ? "Updating..." : "Update story") : (createPostMutation.isPending ? "Publishing..." : "Publish Story")}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

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