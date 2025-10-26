import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@hooks/use-toast';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@components/ui/dialog';
import { Loader2, Send } from 'lucide-react';
import { api } from '@lib/api'; // Import API thật

interface FeedbackPayload {
    content: string;
    context: any;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const [content, setContent] = useState('');

    const mutation = useMutation({
        mutationFn: (feedback: FeedbackPayload) => api.submitFeedback(feedback),
        onSuccess: () => {
            toast({
                title: "Thank You!",
                description: "Your feedback has been sent to the administrator.",
            });
            setContent('');
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Could not send feedback. Please try again.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = () => {
        if (content.trim().length < 10) {
            toast({
                title: "Feedback is too short",
                description: "Please provide more details in your feedback.",
                variant: "destructive",
            });
            return;
        }

        const context = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
        };

        mutation.mutate({ content, context });
    };

    // Reset state khi modal được mở
    useEffect(() => {
        if (isOpen) {
            setContent('');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit Feedback</DialogTitle>
                    <DialogDescription>
                        Have a suggestion or found an issue? Let us know! Your feedback helps us improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Describe your feedback here (e.g., wrong answer in Reading Part 1, Test 'ABC', question 5)..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        disabled={mutation.isPending}
                    />
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending || !content.trim()}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {mutation.isPending ? 'Sending...' : 'Send Feedback'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};