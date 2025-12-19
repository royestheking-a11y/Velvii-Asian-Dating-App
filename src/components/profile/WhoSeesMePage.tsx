import React, { useState, useEffect } from 'react';
import { ChevronLeft, Eye, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { users as apiUsers } from '@/services/api';
import { formatTimeAgo } from '@/utils/helpers';

interface WhoSeesMePageProps {
  onClose: () => void;
  onPremiumClick: () => void;
}

interface ProfileView {
  user: User;
  timestamp: string;
}

export const WhoSeesMePage: React.FC<WhoSeesMePageProps> = ({ onClose, onPremiumClick }) => {
  const { currentUser } = useAuth();
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProfileViews();
    }
  }, [currentUser]);

  const loadProfileViews = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // Simulate profile views using API data
      // Ideally: api.users.getViews(currentUser.id)
      const allUsers = await apiUsers.getAll();

      const simulatedViews: ProfileView[] = allUsers
        .filter(user => user.id !== currentUser.id && user.gender !== currentUser.gender)
        .slice(0, 12)
        .map(user => ({
          user,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setProfileViews(simulatedViews);
    } catch (e) {
      console.error("Error loading views", e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold">Who Sees Me</h1>
      </div>

      {/* Content */}
      <div className="p-4 safe-area-bottom">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Premium Prompt (if not premium) */}
            {!currentUser.isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl p-6 mb-6 text-white shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6" />
                  <span className="text-lg font-bold">VIP Feature</span>
                </div>
                <p className="text-sm mb-4 opacity-90 font-medium">
                  Upgrade to VIP to see who has viewed your profile
                </p>
                <button
                  onClick={onPremiumClick}
                  className="px-6 py-3 bg-white text-purple-600 rounded-full shadow-lg font-bold hover:shadow-xl transition-all"
                >
                  Upgrade Now
                </button>
              </motion.div>
            )}

            {/* Views Count */}
            <div className="bg-gradient-to-br from-purple-400 via-violet-400 to-indigo-500 rounded-3xl p-8 text-center mb-6 relative overflow-hidden shadow-xl">
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl" />

              <div className="relative z-10">
                {/* 3D Icon Container */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm shadow-2xl mb-4">
                  <Eye className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-5xl mb-2 text-white font-bold">{profileViews.length}</h2>
                <p className="text-white/90 text-lg font-medium">profile views this week</p>
              </div>
            </div>

            {/* Views List */}
            {profileViews.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {profileViews.map((view, index) => {
                  const age = view.user.dateOfBirth ? new Date().getFullYear() - new Date(view.user.dateOfBirth).getFullYear() : 25;

                  return (
                    <motion.div
                      key={view.user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={view.user.photos[0]}
                          alt={currentUser.isPremium ? view.user.fullName : 'Hidden'}
                          className={`w-16 h-16 rounded-full object-cover transition-all ${!currentUser.isPremium ? 'blur-md' : ''
                            }`}
                        />
                        {!currentUser.isPremium && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-yellow-500 drop-shadow-md" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {currentUser.isPremium ? view.user.fullName.split(' ')[0] : '???'}, {currentUser.isPremium ? age : '??'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {currentUser.isPremium ? view.user.location.city : 'Upgrade to view'}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-gray-400">
                        {formatTimeAgo(view.timestamp)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {profileViews.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center relative overflow-hidden shadow-sm border border-gray-100">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-50 mb-5">
                  <Eye className="w-10 h-10 text-gray-300" />
                </div>

                <h3 className="text-2xl mb-3 text-gray-900 font-bold">No Views Yet</h3>
                <p className="text-gray-500 text-lg">
                  Your profile hasn't been viewed yet. Keep your profile active!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};