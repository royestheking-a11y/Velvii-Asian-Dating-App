import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, AlertTriangle, X } from 'lucide-react';

interface BlockConfirmationModalProps {
    isOpen: boolean;
    userName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const BlockConfirmationModal: React.FC<BlockConfirmationModalProps> = ({
    isOpen,
    userName,
    onClose,
    onConfirm,
}) => {
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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden border border-gray-100"
                    >
                        {/* ID / Decorative Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-red-50 to-orange-50 -z-10 rounded-t-3xl" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex flex-col items-center text-center mt-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-50" />
                                <Ban className="w-10 h-10 text-red-500 relative z-10" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Block {userName}?
                            </h3>

                            <p className="text-gray-500 mb-8 leading-relaxed px-2">
                                This will permanently remove them from your matches and messages. They won't be able to contact you again.
                            </p>

                            <div className="w-full space-y-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Ban className="w-5 h-5" />
                                    Block User
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <AlertTriangle className="w-3 h-3" />
                                <span>This action cannot be undone</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
