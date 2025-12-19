import React, { useState } from 'react';
import { Info, MessageCircle, Star, X, RotateCcw, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@/types';
import { ProfileDetailModal } from './ProfileDetailModal';
import { getZodiacSign } from '@/utils/helpers';

interface UserCardProps {
  user: User;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  onUndo?: () => void;
  onBoost?: () => void;
  style?: React.CSSProperties;
  canUndo?: boolean;
  active?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onLike,
  onDislike,
  onSuperLike,
  onUndo,
  onBoost,
  style,
  canUndo = false,
  active = true,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
  const distance = Math.floor(Math.random() * 20) + 5;

  const zodiacSign = getZodiacSign(user.dateOfBirth);

  const handleNextPhoto = () => {
    if (!active) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
  };

  const handlePrevPhoto = () => {
    if (!active) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  };

  return (
    <>
      <motion.div
        className="absolute inset-4 top-20 bottom-32"
        style={style}
        drag={active ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) * velocity.x;

          if (swipe > 10000) {
            // Swiped right - Like
            onLike();
          } else if (swipe < -10000) {
            // Swiped left - Dislike
            onDislike();
          }
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Photo */}
          <div className="relative w-full h-full">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />

            {/* Photo Indicators */}
            {(user.settings?.privacy?.privatePhotos ? 1 : user.photos.length) > 1 && (
              <div className="absolute top-4 left-4 right-4 flex gap-2">
                {(user.settings?.privacy?.privatePhotos
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

            {/* Tap Zones for Photo Navigation */}
            {/* Disable navigation if private photos is ON (only 1 photo shown) */}
            {!user.settings?.privacy?.privatePhotos && user.photos.length > 1 && (
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

            {/* Gradient Overlay - Extended for buttons */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

            {/* User Info - Adjusted for new buttons */}
            <div className="absolute bottom-20 left-0 right-0 p-6 pb-4 text-white z-20">
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl">{user.fullName.split(' ')[0]}</h2>
                  {!user.settings?.privacy?.hideAge && <span className="text-3xl">{age}</span>}
                  {user.isVerified && (
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Button - Higher z-index */}
                <button
                  onClick={() => setShowProfile(true)}
                  className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center relative z-30 hover:bg-white/40 transition-all"
                >
                  <Info className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Location */}
              <p className="text-sm mb-3">
                {user.location.city}
                {user.settings?.privacy?.showDistance !== false && ` (${distance}km)`}
              </p>

              {/* Tags */}
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
                  {zodiacSign}
                </span>
              </div>
            </div>

            {/* Tantan Style Action Buttons Overlay */}
            <div
              className="absolute bottom-6 left-0 right-0 px-8 z-30 flex items-center justify-between pb-4 pointer-events-auto"
              onPointerDownCapture={(e) => e.stopPropagation()}
              onTouchStartCapture={(e) => e.stopPropagation()}
            >
              {/* Undo Button (Yellow) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo?.();
                }}
                whileTap={{ scale: 0.9 }}
                disabled={!canUndo}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border border-gray-100 ${canUndo ? 'bg-white text-yellow-500 hover:bg-gray-50' : 'bg-gray-200 text-gray-400'
                  }`}
              >
                <RotateCcw className="w-7 h-7" />
              </motion.button>

              {/* Dislike Button (Gray/White) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDislike();
                }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-xl hover:bg-gray-50"
              >
                <X className="w-9 h-9" />
              </motion.button>

              {/* Super Like Button (Blue Star) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onSuperLike();
                }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue-500 border border-gray-100 shadow-xl hover:bg-gray-50"
              >
                <Star className="w-7 h-7 fill-current" />
              </motion.button>

              {/* Like Button (Pink Heart) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#FF6B6B] border border-gray-100 shadow-xl hover:bg-gray-50"
              >
                <Heart className="w-9 h-9 fill-current" />
              </motion.button>

              {/* Flash/Chat Button (Purple) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Flash clicked');
                  onBoost?.();
                }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-purple-500 border border-gray-100 shadow-xl hover:bg-gray-50"
              >
                <MessageCircle className="w-7 h-7" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>





      {/* Profile Detail Modal */}
      {showProfile && (
        <ProfileDetailModal
          user={user}
          age={age}
          distance={distance}
          zodiacSign={zodiacSign}
          onClose={() => setShowProfile(false)}
          onLike={onLike}
          onDislike={onDislike}
          onSuperLike={onSuperLike}
        />
      )}
    </>
  );
};