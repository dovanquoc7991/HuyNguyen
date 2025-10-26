import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export const FloatingFeedbackButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
                aria-label="Submit Feedback"
            >
                <MessageSquarePlus className="h-6 w-6" />
            </Button>
            <FeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};