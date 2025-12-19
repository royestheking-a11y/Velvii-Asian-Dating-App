import React from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@/types';

interface MatchModalProps {
  matchedUser: User;
  onClose: () => void;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ matchedUser, onClose, onSendMessage }) => {
  // Safety check
  if (!matchedUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#FF6B6B] via-[#FF8E53] to-[#FF6B6B] flex items-center justify-center p-4"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-full max-w-md"
      >
        {/* Content */}
        <div className="text-center text-white mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-12 h-12 fill-white" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl mb-4"
          >
            It's a Match!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/90"
          >
            You and {matchedUser.fullName} liked each other
          </motion.p>
        </div>

        {/* User Photo */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <img
              src={matchedUser.photos[0]}
              alt={matchedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button
            onClick={onSendMessage}
            className="w-full py-4 bg-white text-[#FF6B6B] rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send a Message
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border-2 border-white/30 hover:bg-white/20 transition-all"
          >
            Keep Swiping
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};