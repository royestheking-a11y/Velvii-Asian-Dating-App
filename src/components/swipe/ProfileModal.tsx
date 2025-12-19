import React, { useState } from 'react';
import { X, MapPin, Briefcase, GraduationCap, Ruler, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/types';
import { formatHeight, formatDistance, getCommonInterests } from '@/utils/helpers';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const distance = user.location.coordinates
    ? formatDistance(Math.floor(Math.random() * 50))
    : `${user.location.city}, ${user.location.country}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl">Profile</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo Gallery */}
          <div className="relative">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={user.fullName}
              className="w-full h-[400px] object-cover"
            />

            {/* Photo indicators */}
            {user.photos.length > 1 && (
              <div className="absolute top-4 left-0 right-0 flex gap-2 px-4">
                {user.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Photo navigation */}
            {user.photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  disabled={currentPhotoIndex === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex(Math.min(user.photos.length - 1, currentPhotoIndex + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  disabled={currentPhotoIndex === user.photos.length - 1}
                >
                  ›
                </button>
              </>
            )}

            {/* Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Basic Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl">{user.fullName}, {user.age}</h2>
                {user.isVerified && (
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {user.isOnline && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  Online now
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Bio */}
            {user.bio && (
              <div>
                <h4 className="mb-2">About {user.fullName.split(' ')[0]}</h4>
                <p className="text-gray-600">{user.bio}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<MapPin className="w-5 h-5" />} label="Location" value={distance} />
              {user.job && <InfoItem icon={<Briefcase className="w-5 h-5" />} label="Job" value={user.job} />}
              {user.education && <InfoItem icon={<GraduationCap className="w-5 h-5" />} label="Education" value={user.education} />}
              {user.height && <InfoItem icon={<Ruler className="w-5 h-5" />} label="Height" value={formatHeight(user.height)} />}
            </div>

            {/* Interests */}
            {user.interests.length > 0 && (
              <div>
                <h4 className="mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Looking for */}
            <div>
              <h4 className="mb-2">Looking for</h4>
              <p className="text-gray-600 capitalize">{user.interestedIn}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
};
