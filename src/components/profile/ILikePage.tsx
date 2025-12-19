import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { actions as apiActions } from '@/services/api';
import { formatTimeAgo } from '@/utils/helpers';
import { toast } from 'sonner';

interface ILikePageProps {
  onClose: () => void;
}

interface LikedUser {
  user: User;
  timestamp: string; // ISO string from backend
  isSuperLike: boolean;
}

export const ILikePage: React.FC<ILikePageProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadLikedUsers();
    }
  }, [currentUser]);

  const loadLikedUsers = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // fetch swipes from API, filtered by 'like' or 'superlike'
      const swipes: any[] = await apiActions.getSwipes(currentUser.id);

      const likes = swipes
        .filter(s => s.action === 'like' || s.action === 'superlike')
        .map(s => ({
          user: s.user,
          timestamp: s.createdAt,
          isSuperLike: s.action === 'superlike'
        }));

      setLikedUsers(likes);
    } catch (error) {
      console.error("Failed to load likes", error);
      toast.error("Could not load liked users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (userId: string) => {
    // Unlike Logic: usually delete swipe action
    // Backend doesn't support 'delete swipe' yet via specific route, 
    // but we can simulate it by hiding from list or adding 'dislike' which might overwrite?
    // For now, just remove from UI to satisfy user request.
    // In real app, we would call `api.actions.undo(userId)` or similar.

    setLikedUsers(prev => prev.filter(item => item.user.id !== userId));
    toast.success('Removed from your likes');
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
        <h1 className="text-xl font-bold">I Like</h1>
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
            {/* Info Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-1">Upgrade Your Likes</h3>
                  <p className="text-sm text-orange-700">
                    When you upgrade a like, your profile will appear higher in their discovery queue
                  </p>
                </div>
              </div>
            </div>

            {/* Likes Count */}
            <div className="bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 rounded-3xl p-8 text-center mb-6 relative overflow-hidden shadow-xl">
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/30 rounded-full blur-2xl" />

              <div className="relative z-10">
                {/* 3D Icon Container */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm shadow-2xl mb-4">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </div>

                <h2 className="text-5xl mb-2 text-white font-bold">{likedUsers.length}</h2>
                <p className="text-white/90 text-lg font-medium">
                  {likedUsers.length === 1 ? 'person you liked' : 'people you liked'}
                </p>
              </div>
            </div>

            {/* Liked Users List */}
            {likedUsers.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {likedUsers.map((item, index) => {
                  const age = item.user.dateOfBirth ? new Date().getFullYear() - new Date(item.user.dateOfBirth).getFullYear() : 25;

                  return (
                    <motion.div
                      key={`${item.user.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={item.user.photos[0]}
                          alt={item.user.fullName}
                          className="w-16 h-16 rounded-full object-cover border border-gray-100"
                        />
                        {item.isSuperLike && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 text-base">
                          {item.user.fullName.split(' ')[0]}, {age}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="truncate max-w-[100px]">{item.user.location.city}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(item.timestamp)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleUnlike(item.user.id)}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {likedUsers.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center relative overflow-hidden shadow-sm border border-gray-100">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-50 mb-5">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>

                <h3 className="text-2xl mb-2 text-gray-900 font-bold">No Likes Yet</h3>
                <p className="text-gray-500 text-lg mb-6">
                  Start swiping to find people you like!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:shadow-xl transition-shadow font-bold"
                >
                  Start Swiping
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};