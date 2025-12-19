import React, { useState, useEffect } from 'react';
import { ChevronLeft, Crown, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Match } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { actions as apiActions, matches as apiMatches } from '@/services/api';
import { toast } from 'sonner';
import { ProfileDetailModal } from '../swipe/ProfileDetailModal';
import { generateId } from '@/utils/helpers';

import { useNavigate } from 'react-router-dom';

export const WhoLikesMePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [likesYou, setLikesYou] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const onClose = () => navigate(-1);
  const onPremiumClick = () => navigate('/app/premium');

  useEffect(() => {
    if (currentUser) {
      loadLikes();
    }
  }, [currentUser]);

  const loadLikes = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // API now returns [{ ..., user: User }, ...]
      const likesData: any[] = await apiActions.getLikes(currentUser.id);
      const users = likesData.map(item => item.user);
      setLikesYou(users);
    } catch (error) {
      console.error("Failed to load likes", error);
      toast.error("Could not load likes");
    } finally {
      setLoading(false);
    }
  };

  const handleInteract = (user: User) => {
    if (currentUser?.isPremium) {
      setSelectedUser(user);
    } else {
      onPremiumClick();
    }
  };

  const handleMatch = async () => {
    if (!currentUser || !selectedUser) return;

    try {
      // Use API to Like back (which creates match)
      const response = await apiActions.like(currentUser.id, selectedUser.id, 'like');

      if (response.match) {
        toast.success("It's a Match! 🎉", {
          description: `You and ${selectedUser.fullName} can now chat!`,
          duration: 4000
        });
        // Update local list
        setLikesYou(prev => prev.filter(u => u.id !== selectedUser.id));
      } else {
        // Should verify if backend treats existing like as match trigger?
        // If they already liked us, and we swipe them, it creates match. 
        // In WhoLikesMe, we are seeing people who ALREADY liked us.
        // So if we like them back, it GUARANTEES a match.
        // But let's check backend logic: router.post('/like', ... checks for mutual like).
        // Yes, mutual like check is there.
      }
    } catch (error) {
      console.error("Match error", error);
      toast.error("Failed to match");
    }

    setSelectedUser(null);
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
        <h1 className="text-xl font-bold">See Who Likes Me</h1>
      </div>

      {/* Content */}
      <div className="p-4 safe-area-bottom">

        {/* Loading State */}
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
                className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-3xl p-6 mb-6 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-6 h-6 text-yellow-800" />
                    <span className="text-lg text-yellow-900 font-bold">Unlock Premium</span>
                  </div>
                  <p className="text-sm text-yellow-800 mb-4 font-medium">
                    Upgrade to VIP to see who likes you and get unlimited likes!
                  </p>
                  <button
                    onClick={onPremiumClick}
                    className="px-6 py-3 bg-white text-yellow-800 rounded-full shadow-lg hover:shadow-xl transition-all font-bold"
                  >
                    Upgrade Now
                  </button>
                </div>
                {/* Decorative Icon */}
                <div className="absolute bottom-4 right-4 w-20 h-20 opacity-20">
                  <Sparkles className="w-full h-full text-yellow-700" />
                </div>
              </motion.div>
            )}

            {/* Likes Count */}
            <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-red-500 rounded-3xl p-8 text-center mb-6 relative overflow-hidden shadow-xl">
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-600/30 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm shadow-2xl mb-4">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </div>

                <h2 className="text-5xl mb-2 text-white font-bold">{likesYou.length}</h2>
                <p className="text-white/90 text-lg font-medium">
                  {likesYou.length === 1 ? 'person likes you' : 'people like you'}
                </p>
              </div>
            </div>

            {/* Likes Grid */}
            {likesYou.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {likesYou.map((user) => (
                  <motion.div
                    key={user.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInteract(user)}
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-sm"
                  >
                    {/* Image */}
                    <img
                      src={user.photos[0]}
                      alt={currentUser.isPremium ? user.fullName : 'Hidden'}
                      className={`w-full h-full object-cover transition-all ${!currentUser.isPremium ? 'blur-xl scale-110' : ''}`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

                    {/* Lock Icon (if not premium) */}
                    {!currentUser.isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Crown className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    )}

                    {/* User Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                      <p className="text-lg font-bold">
                        {currentUser.isPremium ? user.fullName.split(' ')[0] : '???'}
                      </p>
                      {currentUser.isPremium && user.dateOfBirth && (
                        <p className="text-sm opacity-90">
                          {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {likesYou.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center relative overflow-hidden shadow-sm border border-gray-100">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-50 mb-5">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl mb-2 text-gray-900 font-bold">No Likes Yet</h3>
                <p className="text-gray-500">
                  Keep swiping! Someone will like you soon.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Detail Modal Interaction */}
      {selectedUser && (
        <ProfileDetailModal
          user={selectedUser}
          age={selectedUser.dateOfBirth ? new Date().getFullYear() - new Date(selectedUser.dateOfBirth).getFullYear() : 25}
          onClose={() => setSelectedUser(null)}
          onLike={handleMatch}
          onSuperLike={handleMatch}
        />
      )}
    </div>
  );
};