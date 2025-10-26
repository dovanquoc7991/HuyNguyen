import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@lib/api';
import { queryClient } from '@lib/queryClient';
import { useToast } from '@hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Check, Eye, User, Calendar, Link as LinkIcon } from 'lucide-react';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@components/ui/alert-dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@components/ui/tooltip';

interface Feedback {
  id: number;
  user_id: number;
  content: string;
  context: { url: string; timestamp: string };
  status: 'new' | 'read' | 'resolved';
  created_at: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function FeedbackListPage() {
  const { toast } = useToast();
  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ['feedbacks'],
    queryFn: () => api.getFeedbacks(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Feedback['status'] }) => api.updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast({ title: "Success", description: "Feedback status updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update status.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast({ title: "Success", description: "Feedback deleted." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete feedback.", variant: "destructive" });
    }
  });

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
            <p className="text-gray-600 mt-1">Review and manage feedback from users.</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            </CardContent>
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-16">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                <p className="mt-1 text-sm text-gray-500">When users submit feedback, it will appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Submitted</TableHead>
                    <TableHead className="text-right w-[250px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="font-medium">{feedback.user.firstName} {feedback.user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{feedback.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-md truncate" title={feedback.content}>{feedback.content}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          <a href={feedback.context.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                            <LinkIcon size={12} />
                            <span>Context URL</span>
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          switch (feedback.status) {
                            case 'new': return <Badge variant="destructive">New</Badge>;
                            case 'read': return <Badge variant="secondary">Read</Badge>;
                            case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
                            default: return <Badge>{feedback.status}</Badge>;
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(new Date(feedback.created_at), 'PPpp')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {feedback.status === 'new' && (
                            <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ id: feedback.id, status: 'read' })}>
                              <Eye className="mr-2 h-4 w-4" /> Read
                            </Button>
                          )}
                          {feedback.status !== 'resolved' && (
                            <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ id: feedback.id, status: 'resolved' })}>
                              <Check className="mr-2 h-4 w-4" /> Resolve
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete this feedback. This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(feedback.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}