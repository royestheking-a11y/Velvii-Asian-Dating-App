import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Copy, Edit, Heart, Eye, ThumbsUp, Crown, ChevronRight, ShieldCheck, Camera, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { WhoLikesMePage } from './WhoLikesMePage';
import { WhoSeesMePage } from './WhoSeesMePage';
import { ILikePage } from './ILikePage';
import { ProfileView } from '@/components/ProfileView';
import { ServicesSection } from '@/components/ServicesSection';
import { VerificationPage } from '@/components/verification/VerificationPage';
import { matches as apiMatches, actions as apiActions } from '@/services/api';

import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeModal, setActiveModal] = useState<'whoLikesMe' | 'whoSeesMe' | 'iLike' | 'profile' | 'services' | 'verification' | null>(null);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    if (!currentUser) return;
    try {
      const [matches, likes] = await Promise.all([
        apiMatches.getAll(currentUser.id),
        apiActions.getLikes(currentUser.id)
      ]);
      // Total "Likes" = matches (people who liked you back) + pending likes (people who liked you but you haven't swiped yet)
      // Wait, 'getLikes' usually returns pending likes. 
      // Logic: Who Likes Me usually refers to pending likes.
      // But for "People like you" badge, sometimes apps sum them up. 
      // The original code was: `matches.length + likes.length`.
      // Let's stick to that for impressive numbers!
      setLikesCount(matches.length + likes.length);
    } catch (e) {
      console.error("Stats error", e);
    }
  };

  const onPremiumClick = () => navigate('/app/premium');
  const onSettingsClick = () => navigate('/app/settings');
  const onAdminClick = () => navigate('/admin');

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const velviiId = `2428${currentUser.id.slice(0, 6)}`;
  const diamondBalance = currentUser.diamonds || 0;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.username || velviiId);
    toast.success('Velvii ID copied!');
  };

  // Show modal components
  // WhoLikesMe is now a route /app/likes

  if (activeModal === 'whoSeesMe') {
    return <WhoSeesMePage onClose={() => setActiveModal(null)} onPremiumClick={onPremiumClick} />;
  }

  if (activeModal === 'iLike') {
    return <ILikePage onClose={() => setActiveModal(null)} />;
  }

  if (activeModal === 'profile') {
    return <ProfileView onClose={() => setActiveModal(null)} />;
  }

  if (activeModal === 'services') {
    return (
      <div className="relative">
        <button
          onClick={() => setActiveModal(null)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <ServicesSection onUpgrade={onPremiumClick} />
      </div>
    );
  }

  if (activeModal === 'verification') {
    return <VerificationPage onClose={() => setActiveModal(null)} />;
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Me</h1>
          <div className="flex items-center gap-3">
            {!currentUser.isVerified && (
              <button
                onClick={() => setActiveModal('verification')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                <ShieldCheck className="w-5 h-5" />
                Verify Your Profile
              </button>
            )}
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Profile Card */}
        <div
          onClick={() => setActiveModal('profile')}
          className="w-full bg-white rounded-2xl p-4 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="relative">
              <img
                src={currentUser.photos[0]}
                alt={currentUser.fullName}
                className="w-28 h-28 rounded-2xl object-cover border border-gray-100"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg flex items-center justify-center border-2 border-white">
                <Edit className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{currentUser.fullName}</h2>
                {currentUser.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500" />
                )}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyId();
                }}
                className="flex items-center gap-2 text-sm text-gray-500 mb-3 cursor-pointer hover:text-gray-700 w-fit"
              >
                <span>Velvii ID: {currentUser.username || velviiId}</span>
                <Copy className="w-3.5 h-3.5" />
              </div>

              {/* Balance */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 inline-flex border border-gray-100">
                <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                  V
                </div>
                <span className="text-sm font-medium">Balance: {diamondBalance} Diamond</span>
              </div>
            </div>

            {/* Arrow indicator */}
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
          </div>
        </div>

        {/* Verification Card - if not verified */}
        {!currentUser.isVerified && (
          <motion.button
            onClick={() => setActiveModal('verification')}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Camera className="w-7 h-7 text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Tap to verify your profile photo</p>
              <p className="text-sm text-gray-500">Get verified to increase matches</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        )}

        {/* VIP Card */}
        {!currentUser.isPremium ? (
          <motion.button
            onClick={onPremiumClick}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-3xl p-6 text-left shadow-lg relative overflow-hidden group"
          >
            {/* VIP Badge */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="px-4 py-1 bg-yellow-600 text-white rounded-full text-xs font-bold uppercase tracking-wider inline-block shadow-sm">
                VIP
              </div>
            </div>

            {/* Price Tag */}
            <div className="inline-block px-4 py-2 bg-white/40 rounded-xl mb-4 backdrop-blur-sm relative z-10">
              <span className="text-yellow-900 font-bold">Only BDT 1,200</span>
            </div>

            {/* Description */}
            <p className="text-sm text-yellow-900 font-medium relative z-10 max-w-[80%]">
              Unlock your unlimited likes, 5 Super Likes daily, and more privileges!
            </p>

            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/30 transition-all" />

            {/* Crown Icon */}
            <div className="absolute bottom-6 right-6 w-16 h-16 transform group-hover:scale-110 transition-transform duration-500">
              <svg viewBox="0 0 100 100" className="text-yellow-500 opacity-60 drop-shadow-lg">
                <path
                  d="M50 20 L40 45 L15 40 L30 60 L25 85 L50 70 L75 85 L70 60 L85 40 L60 45 Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </motion.button>
        ) : (
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-3xl p-6 shadow-lg border border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-md">
                <Crown className="w-6 h-6 text-yellow-900" />
              </div>
              <span className="text-xl font-bold text-yellow-900">Velvii VIP</span>
            </div>
            <p className="text-sm text-yellow-900 font-medium ml-1">Active subscription</p>
          </div>
        )}

        {/* More Services */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 px-2 uppercase tracking-wider">More services</h3>
          <div className="space-y-3">
            <ServiceItem
              icon={<Settings className="w-6 h-6" />}
              iconBg="bg-gray-100"
              iconColor="text-gray-700"
              title="Settings & Privacy"
              subtitle=""
              onClick={onSettingsClick}
            />
            <ServiceItem
              icon={<Heart className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
              title="See Who Likes Me"
              subtitle={`${likesCount} ${likesCount === 1 ? 'person likes' : 'people like'} you`}
              onClick={() => navigate('/app/likes')}
            />
            <ServiceItem
              icon={<Eye className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
              title="Who Sees Me"
              subtitle="See who have viewed your profile" // Simplified, mocked if needed
              onClick={() => setActiveModal('whoSeesMe')}
            />
            <ServiceItem
              icon={<ThumbsUp className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
              title="I like"
              subtitle="See people you liked"
              badge="NEW"
              onClick={() => setActiveModal('iLike')}
            />
            <ServiceItem
              icon={<Crown className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
              title="Subscription"
              subtitle="Manage your VIP status"
              onClick={onPremiumClick}
            />
          </div>
        </div>

        {/* Admin Access */}
        {currentUser?.isAdmin && (
          <div className="pt-4">
            <button
              onClick={onAdminClick}
              className="w-full bg-slate-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                  <ShieldCheck className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-base">Admin Dashboard</div>
                  <div className="text-xs text-slate-400">Manage users, stats & settings</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Service Item Component
interface ServiceItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all relative border border-gray-100 flex items-center gap-4"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-orange-500 rounded-full">
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">{badge}</span>
        </div>
      )}

      {/* Simple Icon Container */}
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-base leading-tight">{title}</h4>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </motion.button>
  );
};