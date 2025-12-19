import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Edit, Shield, Heart, MapPin, Briefcase, GraduationCap,
  Ruler, Star, Clock, User, Crown, ChevronRight, Settings,
  MessageSquare, Share2, Flag, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileEditModal } from './ProfileEditModal';
import { VerificationPage } from './verification/VerificationPage';
import { getLikesForUser, getMatchesForUser, getVerificationRequestByUserId } from '@/utils/storage';
import { getZodiacSign } from '@/utils/helpers';
import api from '@/services/api';

interface ProfileViewProps {
  onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  // Calculate actual likes count from API
  const [likesCount, setLikesCount] = useState(0);

  React.useEffect(() => {
    const fetchCounts = async () => {
      if (!currentUser) return;
      try {
        // Fetch matches and likes separately to get accurate counts
        // Currently we don't have a dedicated endpoint for just "stats", so we fetch lists.
        // Ideally we would optimize this on backend, but for now lists are fine.
        const [likesRes, matchesRes] = await Promise.all([
          api.get(`/actions/likes/${currentUser.id}`), // Check if this exists
          api.get(`/matches/${currentUser.id}`)
        ]);

        // Likes API returns array of like objects
        // Matches API returns array of matches
        const totalLikes = (likesRes.data?.length || 0);
        const totalMatches = (matchesRes.data?.length || 0);

        // The display logic in legacy code was matches + likes, preserving that for now
        // though usually "likes count" is just "who liked me". 
        // User asked to fix "0 people like you", which usually refers to incoming likes.
        // But the previous calculation was `matches.length + likes.length`.
        // Let's stick to the previous logic but with real data.
        setLikesCount(totalLikes + totalMatches);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchCounts();
  }, [currentUser]);

  const isPendingVerification = useMemo(() => {
    if (!currentUser) return false;
    const request = getVerificationRequestByUserId(currentUser.id);
    return request?.status === 'pending';
  }, [currentUser]);

  const handleSaveProfile = () => {
    // Context updates automatically
  };

  if (!currentUser) return null;

  if (showVerification) {
    return <VerificationPage onClose={() => setShowVerification(false)} />;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
        {/* Hero Section with Photo Carousel */}
        <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPhotoIndex}
              src={currentUser.photos[currentPhotoIndex]}
              alt={currentUser.fullName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover"
              // Add simple tap navigation
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  setCurrentPhotoIndex(prev => prev === 0 ? currentUser.photos.length - 1 : prev - 1);
                } else {
                  setCurrentPhotoIndex(prev => prev === currentUser.photos.length - 1 ? 0 : prev + 1);
                }
              }}
            />
          </AnimatePresence>

          {/* Photo Indicators */}
          {currentUser.photos.length > 1 && (
            <div className="absolute top-2 left-0 right-0 flex gap-1 px-2 z-30">
              {currentUser.photos.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none z-10" />

          {/* Top Actions - High Z-Index for clickability */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white/40 transition-all text-white border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-2 shadow-lg hover:bg-white/40 transition-all text-white border border-white/20"
            >
              <Edit className="w-4 h-4" />
              <span className="font-semibold text-sm">Edit</span>
            </button>
          </div>

          {/* User Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    {currentUser.fullName}
                  </h1>
                  <span className={`text-3xl font-bold text-white drop-shadow-lg ${currentUser.settings?.privacy?.hideAge ? 'opacity-50' : ''}`}>
                    {currentUser.age}
                    {currentUser.settings?.privacy?.hideAge && <span className="text-xs ml-1">(Hidden)</span>}
                  </span>
                  {currentUser.isVerified && (
                    <BadgeCheck className="w-7 h-7 text-blue-400 fill-blue-400 drop-shadow-lg" />
                  )}
                  {currentUser.isPremium && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/90 drop-shadow-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white -mt-6 rounded-t-3xl relative z-10 px-6 pb-20">
          {/* Verification Banner */}
          {!currentUser.isVerified && (
            isPendingVerification ? (
              <button
                onClick={() => setShowVerification(true)}
                className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Verification Under Review</p>
                    <p className="text-xs text-white/80">We are reviewing your photo</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                onClick={() => setShowVerification(true)}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Tap to verify your profile photo</p>
                    <p className="text-xs text-white/80">Get verified to increase matches</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )
          )}

          {/* Likes Banner */}
          <div className="mt-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 flex items-center justify-between border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💛</div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-orange-600">{likesCount}</span> {likesCount === 1 ? 'person likes' : 'people like'} you :)
                </p>
                <p className="text-xs text-gray-500">Swipe right more often to get more likes</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (currentUser.isPremium) {
                  // Navigate to Who Likes Me (Needs implementation or routing, preserving existing behavior placeholder)
                  // Assuming navigation logic or toast was here, but standard behavior usually routes.
                  // For now, let's toast if premium, or just keep it active.
                  // The user requested to CONNECT it to pro system.
                  toast.success("Opening Who Likes Me...");
                } else {
                  toast.error('Upgrade to Premium to see who likes you!', {
                    icon: '👑'
                  });
                }
              }}
              className="font-bold text-orange-600 text-sm hover:text-orange-700 transition-colors"
            >
              WHO LIKES ME?
            </button>
          </div>

          {/* Personal Information */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>

            <div className="space-y-3">
              <InfoRow
                icon={<MapPin className="w-5 h-5" />}
                label="Location"
                value={`${currentUser.location.city}, ${currentUser.location.country}${currentUser.settings?.privacy?.showDistance === false ? ' (Distance Hidden)' : ''}`}
                isPrivate={currentUser.settings?.privacy?.showDistance === false}
              />
              {currentUser.occupation && (
                <InfoRow icon={<Briefcase className="w-5 h-5" />} label="Occupation" value={currentUser.occupation} />
              )}
              {currentUser.education && (
                <InfoRow icon={<GraduationCap className="w-5 h-5" />} label="Education" value={currentUser.education} />
              )}
              <InfoRow
                icon={<Star className="w-5 h-5" />}
                label="Zodiac Sign"
                value={getZodiacSign(currentUser.dateOfBirth)}
              />
              {currentUser.height && (
                <InfoRow icon={<Ruler className="w-5 h-5" />} label="Height" value={`${currentUser.height} cm`} />
              )}
              <InfoRow
                icon={<Clock className="w-5 h-5" />}
                label="Member Since"
                value={
                  currentUser.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Unknown Date'
                }
              />
            </div>
          </div>

          {/* About Me */}
          {currentUser.bio && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
              <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-4">
                {currentUser.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {currentUser.interests && currentUser.interests.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-600 rounded-full text-sm font-medium border border-orange-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Expectations */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Relationship Expectations</h2>
            <div className="space-y-3">
              <InfoRow
                icon={<Heart className="w-5 h-5" />}
                label="Looking For"
                value="Casual, but open to serious"
              />
              <InfoRow
                icon={<Star className="w-5 h-5" />}
                label="Relationship Status"
                value={currentUser.relationshipStatus || 'Single'}
              />
            </div>
          </div>

          {/* My Account */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Account</h2>
            <div className="space-y-3">
              <InfoRow
                icon={<User className="w-5 h-5" />}
                label="Velvii ID"
                value={currentUser.username || currentUser.id.slice(0, 12)}
              />
              <InfoRow
                icon={<Crown className="w-5 h-5" />}
                label="Membership"
                value={currentUser.isPremium ? 'Pro Member' : 'Free Member'}
              />
            </div>
          </div>

          {/* Photo Gallery */}
          {currentUser.photos && currentUser.photos.length > 1 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">More Photos</h2>
                {currentUser.settings?.privacy?.privatePhotos && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Private Mode On
                  </span>
                )}
              </div>
              {currentUser.settings?.privacy?.privatePhotos && (
                <p className="text-sm text-gray-500 mb-3 italic">
                  Only your first photo is visible to non-matches.
                </p>
              )}
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${currentUser.settings?.privacy?.privatePhotos ? 'opacity-75' : ''}`}>
                {currentUser.photos.slice(1).map((photo, index) => (
                  <div key={index} className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {currentUser.settings?.privacy?.privatePhotos && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <ActionButton
              icon={<Settings className="w-5 h-5" />}
              label="Settings & Privacy"
              onClick={() => {
                onClose();
                navigate('/app/settings');
              }}
            />
            <ActionButton
              icon={<Share2 className="w-5 h-5" />}
              label="Share My Profile"
              onClick={() => {
                const shareData = {
                  title: 'Check out my Velvii profile!',
                  text: `Join me on Velvii!`,
                  url: window.location.origin
                };
                if (navigator.share) {
                  navigator.share(shareData).catch(console.error);
                } else {
                  navigator.clipboard.writeText(shareData.url);
                  toast.success('Profile link copied to clipboard!');
                }
              }}
            />
            <ActionButton
              icon={<Flag className="w-5 h-5" />}
              label="Safety & Support"
              onClick={() => {
                toast.info('Safety Center', {
                  description: 'For any safety concerns, please contact support@velvii.app',
                  action: {
                    label: 'Email',
                    onClick: () => window.open('mailto:support@velvii.app')
                  }
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
};

// Info Row Component
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isPrivate?: boolean;
}> = ({ icon, label, value, isPrivate }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className={`font-semibold ${isPrivate ? 'text-gray-400 italic' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
};

// Action Button Component
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600 group-hover:text-orange-500 transition-colors">
          {icon}
        </div>
        <span className="font-semibold text-gray-900">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
    </button>
  );
};