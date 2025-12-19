import React, { useState } from 'react';
import { Send, Users, AlertCircle, CheckCircle, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { admin } from '@/services/api';
import { toast } from 'sonner';

export const BroadcastSection = () => {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('Announcement');
    const [sending, setSending] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [stats, setStats] = useState<{ sent: number } | null>(null);

    const handleBroadcast = async () => {
        if (!message.trim()) return;

        setSending(true);

        try {
            const result = await admin.sendBroadcast({
                title,
                message,
                type: 'info',
                targetAudience: 'all'
            });

            setStats({ sent: result.sentCount });
            setMessage('');
            setShowConfirmation(false);
            toast.success(`Announcement sent to ${result.sentCount} users!`);

        } catch (error) {
            console.error('Broadcast failed:', error);
            toast.error('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    if (stats) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    Your announcement has been delivered to <span className="font-bold text-gray-900">{stats.sent}</span> active users.
                </p>
                <button
                    onClick={() => setStats(null)}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcast Center</h1>
                    <p className="text-gray-500">Send announcements and updates to all users</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Content
                        </label>
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your announcement here..."
                                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-gray-900 placeholder-gray-400"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                                {message.length} characters
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">About Broadcasts</p>
                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                <li>Messages will be sent from the "Team Velvii" official account.</li>
                                <li>Recipients will receive a notification and see it in their messages.</li>
                                <li>Action is performed server-side for reliability.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={() => setMessage('')}
                            className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => setShowConfirmation(true)}
                            disabled={!message.trim() || sending}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Broadcast</h3>
                        <p className="text-center text-gray-500 mb-8">
                            You are about to send this message to ALL users. This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBroadcast}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                            >
                                Yes, Send It
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
