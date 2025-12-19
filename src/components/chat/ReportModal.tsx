import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
    isOpen: boolean;
    userName: string;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
    "Fake Profile / Scammer",
    "Inappropriate Messages",
    "Harassment / Bullying",
    "Underage User",
    "Spam / Commercial",
    "Other"
];

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    userName,
    onClose,
    onSubmit,
}) => {
    const [step, setStep] = useState<'reason' | 'details'>('reason');
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error("Please select a reason");
            return;
        }

        setIsSubmitting(true);
        // Simulate network delay for UX
        setTimeout(() => {
            onSubmit(selectedReason, details);
            setIsSubmitting(false);
            // Reset state for next time
            setStep('reason');
            setSelectedReason('');
            setDetails('');
        }, 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 pb-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-red-500">
                                    <ShieldAlert className="w-6 h-6" />
                                    <span className="font-bold text-lg">Report User</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Why are you reporting {userName}?
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                Your report is anonymous and helps keep our community safe.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <AnimatePresence mode="wait">
                                {step === 'reason' ? (
                                    <motion.div
                                        key="reason"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-3"
                                    >
                                        {REPORT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => {
                                                    setSelectedReason(reason);
                                                    setStep('details');
                                                }}
                                                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-red-100 hover:bg-red-50/50 transition-all flex items-center justify-between group"
                                            >
                                                <span className="font-medium text-gray-700 group-hover:text-red-700">{reason}</span>
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-red-50 p-3 rounded-lg flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div className="text-sm text-red-700">
                                                <span className="font-bold block mb-1">Reason: {selectedReason}</span>
                                                <p>Providing details helps us review this faster.</p>
                                            </div>
                                        </div>

                                        <textarea
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            placeholder="Share more details (optional)..."
                                            className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none bg-gray-50 placeholder:text-gray-400"
                                        />

                                        <div className="flex items-center gap-3 mt-4">
                                            <button
                                                onClick={() => setStep('reason')}
                                                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="w-5 h-5" />
                                                        Submit Report
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
