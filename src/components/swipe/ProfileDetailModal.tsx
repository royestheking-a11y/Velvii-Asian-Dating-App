import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/types';
import { getZodiacSign, formatLastActive } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileDetailModalProps {
  user: User;
  age?: number;
  distance?: number;
  zodiacSign?: string;
  onClose: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onSuperLike?: () => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  user,
  age,
  distance,
  zodiacSign,
  onClose,
  onLike,
  onDislike,
  onSuperLike,
}) => {
  const { currentUser } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const registrationMonths = Math.floor(Math.random() * 24) + 1;

  const emojis = ['😊', '😎', '🥰', '😘', '🤗', '😇', '🌟', '❤️', '🔥', '💯', '✨', '🎉', '🌹', '💕', '😍', '🤩'];

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  };

  const handleMatch = () => {
    if (!currentUser?.isPremium) {
      toast.error('Match is a Premium feature!', {
        description: 'Upgrade to match directly with users 👑',
        icon: '👑'
      });
      return;
    }
    onLike?.();
    onClose();
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    toast.success(`Selected ${emoji}`);
  };

  /* Custom System Profile UI */
  const isSystemUser = user.email === 'team@velvii.app';

  if (isSystemUser) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[9999] bg-white overflow-y-auto"
        >
          {/* System Hero Section */}
          <div className="relative h-[45vh] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex flex-col items-center justify-center text-white p-6 text-center">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo & Branding */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-32 h-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center mb-6 transform rotate-3"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Team Velvii</h1>
                <div className="bg-white text-orange-500 rounded-full p-1 shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-white/90 font-medium text-lg">Official System Account</p>
            </motion.div>
          </div>

          {/* System Content */}
          <div className="px-6 py-8 -mt-8 relative z-10 bg-white rounded-t-3xl min-h-[50vh]">

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">About Us</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {user.bio || "We are the team behind Velvii! We're here to ensure you have the best experience possible. Watch this space for official announcements, updates, and community news."}
              </p>
            </div>

            {/* Features/Info Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Official Updates</h3>
                  <p className="text-sm text-gray-600">You'll receive important notifications about new features and improvements directly from this profile.</p>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Community Support</h3>
                  <p className="text-sm text-gray-600">We care about your safety and experience. This account helps manage the community.</p>
                </div>
              </div>
            </div>

            {/* Contact / Action Area */}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-sm mb-6">Velvii Inc. • San Francisco, CA</p>

              {onLike && (
                <button
                  onClick={handleMatch}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                  Message Support
                </button>
              )}
            </div>

          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[9999] bg-white overflow-y-auto"
      >
        {/* Photo Section */}
        <div className="relative h-[60vh] min-h-[400px]">
          <img
            src={user.photos[currentPhotoIndex]}
            alt={user.fullName}
            className="w-full h-full object-cover"
          />

          {/* Photo Indicators */}
          {(user.settings?.privacy?.privatePhotos && onLike ? 1 : user.photos.length) > 1 && (
            <div className="absolute top-4 left-4 right-4 flex gap-2">
              {(user.settings?.privacy?.privatePhotos && onLike
                ? user.photos.slice(0, 1)
                : user.photos
              ).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  {index === currentPhotoIndex && (
                    <div className="h-full bg-white rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tap Zones */}
          {user.photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                aria-label="Previous photo"
              />
              <button
                onClick={handleNextPhoto}
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                aria-label="Next photo"
              />
            </>
          )}

          {/* Close Button - Simple Mini Cross in Corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center z-20 hover:bg-gray-900/90 transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 pb-32">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl">
              {user.fullName.split(' ')[0]}
              {!user.settings?.privacy?.hideAge && `, ${age || user.age}`}
            </h1>
            {user.isVerified && (
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Location & Active Status */}
          {(distance !== undefined || user.location.city) && (
            <p className="text-gray-500 mb-6">
              {user.location.city}
              {user.settings?.privacy?.showDistance !== false && distance !== undefined ? ` (${distance}km)` : ''}
              {/* Show Active Status if allowed */}
              {user.settings?.privacy?.showLastActive !== false && (
                <> · {formatLastActive(user.lastActive, user.isOnline)}</>
              )}
            </p>
          )}

          {/* Pick Emoji Section */}
          <div className="relative mb-6">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full bg-blue-50 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {selectedEmoji ? (
                  <span className="text-2xl">{selectedEmoji}</span>
                ) : (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                )}
                <span className="text-gray-700">
                  {selectedEmoji ? `Selected ${selectedEmoji}` : 'Pick your favorite emoji'}
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showEmojiPicker ? 'rotate-90' : ''}`} />
            </button>

            {/* Emoji Picker Dropdown */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 bg-white shadow-xl rounded-2xl p-4 border border-gray-200"
                >
                  <div className="grid grid-cols-8 gap-3">
                    {emojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        whileTap={{ scale: 0.9 }}
                        className="text-3xl p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl mb-4">Personal Information</h2>
            <div className="space-y-4">
              {zodiacSign && <InfoRow label="Star Sign" value={zodiacSign} />}
              <InfoRow
                label="Registration Time"
                value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
            </div>
          </div>

          {/* Relationship Expectations */}
          <div className="mb-8">
            <h2 className="text-xl mb-4">Relationship Expectations</h2>
            <div className="space-y-4">
              <InfoRow label="Search" value="Serious relationship" />
            </div>
          </div>

          {/* My Account */}
          <div className="mb-8">
            <h2 className="text-xl mb-4">My Account</h2>
            <div className="space-y-4">
              <InfoRow label="Velvii ID" value={user.username || user.id.slice(0, 8)} />
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 flex items-center justify-center gap-4">
          {/* Dislike Button (X) */}
          {onDislike && (
            <motion.button
              onClick={() => {
                onDislike();
                onClose();
              }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}

          {/* Super Like Button (Star) */}
          {onSuperLike && (
            <motion.button
              onClick={() => {
                onSuperLike();
                onClose();
              }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-cyan-400 shadow-lg flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.button>
          )}

          {/* Like Button (Heart) */}
          {onLike && (
            <motion.button
              onClick={() => {
                onLike();
                onClose();
              }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 shadow-lg flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.button>
          )}

          {/* Match Button - only show if onLike is provided */}
          {onLike && (
            <motion.button
              onClick={handleMatch}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full shadow-lg flex items-center gap-2 relative overflow-hidden"
            >
              {/* Premium Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />

              <div className="flex items-center gap-2 relative z-10">
                <Crown className="w-4 h-4 text-yellow-400" fill="currentColor" />
                <span className="font-medium">Match</span>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
};