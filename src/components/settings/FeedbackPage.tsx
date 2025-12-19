import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, Star, Bug, Lightbulb, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { actions } from '@/services/api';
import { Feedback } from '@/types';

interface FeedbackPageProps {
    onClose: () => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [type, setType] = useState<Feedback['type']>('suggestion');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please enter your feedback message');
            return;
        }

        if (!currentUser) return;

        setIsSubmitting(true);

        try {
            await actions.submitFeedback({
                userId: currentUser.id,
                type,
                message,
                rating: rating > 0 ? rating : undefined
            });

            toast.success('Thank you for your feedback!');
            onClose();
        } catch (error) {
            console.error('Failed to submit feedback', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIconForType = (t: Feedback['type']) => {
        switch (t) {
            case 'bug': return <Bug className="w-5 h-5" />;
            case 'suggestion': return <Lightbulb className="w-5 h-5" />;
            case 'content': return <FileText className="w-5 h-5" />;
            default: return <MessageSquare className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 z-10">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-xl">Send Feedback</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto">
                <p className="text-gray-600 mb-6">
                    We'd love to hear from you! Your feedback helps us improve Velvii.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">What is this regarding?</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['suggestion', 'bug', 'content', 'other'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${type === t
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`${type === t ? 'text-orange-500' : 'text-gray-400'}`}>
                                        {getIconForType(t)}
                                    </div>
                                    <span className="capitalize font-medium">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating (Optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Rate your experience (optional)</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Your Feedback</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what you think..."
                            className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            'Sending...'
                        ) : (
                            <>
                                <span>Submit Feedback</span>
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
