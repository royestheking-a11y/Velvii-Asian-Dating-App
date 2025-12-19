import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Bug, Lightbulb, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Feedback } from '@/types';
import { admin } from '@/services/api';
import { toast } from 'sonner';

export const FeedbackSection: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await admin.getFeedback();
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to load feedback", error);
            toast.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get author name from feedback object if populated, or placeholder
    // Backend should ideally populate this. For now, we assume user data might not be joined unless backend does it.
    // Our backend route currently just does Feedback.find(). It doesn't populate User.
    // We should treat userId as the identifier unless we update backend to populate.
    // Update: I will just use userId or a placeholder for now.
    const getAuthor = (userId: string) => {
        return "User " + userId.substring(0, 6);
    };

    const handleStatusChange = async (id: string, newStatus: Feedback['status']) => {
        try {
            await admin.updateFeedback(id, { status: newStatus });
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
            toast.success(`Feedback marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredFeedbacks = feedbacks.filter(f =>
        filter === 'all' ? true : f.status === filter
    );

    const getIconForType = (type: Feedback['type']) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-400" />;
            case 'suggestion': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
            case 'content': return <FileText className="w-4 h-4 text-blue-400" />;
            default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: Feedback['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'read': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) return <div className="text-white">Loading feedback...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">User Feedback</h2>
                    <p className="text-gray-400">View and manage feedback submitted by users</p>
                </div>

                {/* Filter */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(['all', 'new', 'read', 'resolved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <span className="capitalize">{f}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Feedback</p>
                            <h3 className="text-2xl font-bold text-white">{feedbacks.length}</h3>
                        </div>
                    </div>
                </div>
                {/* ... (Other stats cards same structure) ... */}
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedbacks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No feedback found</p>
                    </div>
                ) : (
                    filteredFeedbacks.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold border border-white/10">
                                        {getAuthor(item.userId).charAt(0)}
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-white font-semibold">{getAuthor(item.userId)}</h4>
                                            <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1 bg-gray-800 border-gray-700 text-gray-300 capitalize`}>
                                                {getIconForType(item.type)}
                                                {item.type}
                                            </span>
                                            {item.rating && (
                                                <span className="px-2 py-0.5 rounded text-xs border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400" />
                                                    {item.rating}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </div>

                                    {item.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleStatusChange(item.id, 'resolved')}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
