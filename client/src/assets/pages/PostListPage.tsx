import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { queryClient } from "@lib/queryClient";
import { api } from "../lib/api";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@components/ui/alert-dialog";
import { Pagination } from "@components/pagination";
import { FaFileAlt, FaFileAudio, FaRegClock } from "react-icons/fa";

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'reading' | 'listening';
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;
const POST_TYPES: Post['type'][] = ['reading', 'listening'];

const POST_TYPE_CONFIG = {
  reading: {
    title: "Shore stories",
    Icon: FaFileAlt,
    colorClasses: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    createLink: "/admin/create-stories",
    editLink: "/admin/create-stories", // Thêm link edit
  },
  listening: {
    title: "Shore stories",
    Icon: FaFileAudio,
    colorClasses: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    createLink: "/admin/create-stories",
    editLink: "/admin/create-stories", // Thêm link edit
  },
};

export default function PostListPage() {
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<Post['type']>(POST_TYPES[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
      return apiRequest("GET", api.getPosts(), undefined, token);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => api.deletePost(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Story deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete story", variant: "destructive" });
    },
  });

  const filteredPosts = posts
    .filter(post => post.type === selectedType)
    .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const handleDeletePost = (id: number) => {
    deletePostMutation.mutate(id);
  };

  const config = POST_TYPE_CONFIG[selectedType];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Posts</h2>
            <p className="text-gray-600 mt-1">Manage and organize your stories</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
              {POST_TYPES.map(type => (
                <Button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  variant={selectedType === type ? 'default' : 'ghost'}
                  className="flex-1 sm:flex-auto capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search by stories title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>{config.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2"><Skeleton className="h-8 w-16" /></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <config.Icon className={`mx-auto text-6xl text-gray-400 mb-4`} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No {selectedType} stories found</h3>
                <p className="text-gray-600 mb-6">Create your first {selectedType} stories to get started</p>
                <Link href={config.createLink}>
                  <Button><i className="fas fa-plus mr-2"></i>Create Stories</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${config.colorClasses.bg} rounded-lg flex items-center justify-center`}>
                          <config.Icon className={config.colorClasses.text} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><FaRegClock className="shrink-0" />Created on {new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`${config.editLink}/${post.id}`}>
                          <Button variant="outline" size="sm"><i className="fas fa-edit mr-2"></i>Edit</Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"><i className="fas fa-trash mr-2"></i>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the story "{post.title}".</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
