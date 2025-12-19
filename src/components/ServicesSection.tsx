import React from 'react';
import { motion } from 'motion/react';
import { 
  Crown, Zap, Shield, Eye, Heart, TrendingUp, 
  MessageSquare, Star, ChevronRight, Sparkles, Gift
} from 'lucide-react';
import { getCurrentUser } from '@/utils/storage';

interface ServicesSectionProps {
  onUpgrade: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onUpgrade }) => {
  const currentUser = getCurrentUser();
  const isPremium = currentUser?.isPremium || false;

  const proFeatures = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Unlimited Likes',
      description: 'Like as many profiles as you want',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'See Who Likes You',
      description: 'Know who swiped right on you',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '5 Super Likes/Day',
      description: 'Stand out with Super Likes',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Profile Boost',
      description: 'Be the top profile in your area',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy Controls',
      description: 'Advanced privacy settings',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Premium Badge',
      description: 'Show your premium status',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const additionalServices = [
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      title: 'Profile Verification',
      description: 'Get verified to increase trust',
      badge: 'Free',
      badgeColor: 'bg-green-500',
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: 'Boost Your Profile',
      description: 'Be seen by more people for 30 minutes',
      badge: '$4.99',
      badgeColor: 'bg-blue-500',
    },
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: 'Super Like Package',
      description: 'Get 10 Super Likes',
      badge: '$9.99',
      badgeColor: 'bg-pink-500',
    },
    {
      icon: <Gift className="w-6 h-6 text-orange-500" />,
      title: 'Send a Gift',
      description: 'Send virtual gifts to matches',
      badge: 'From $2.99',
      badgeColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-pink-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Premium Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-8 mb-8 shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Velvii Pro</h2>
                <p className="text-white/90">Unlock premium features</p>
              </div>
            </div>

            {isPremium ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">You're a Pro Member! 🎉</p>
                    <p className="text-white/80 text-sm">Enjoying all premium features</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-yellow-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Renews on</p>
                    <p className="text-white font-semibold">
                      {currentUser?.premiumUntil ? new Date(currentUser.premiumUntil).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-white/90 transition-all">
                    Manage
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {proFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-white/70 text-xs">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={onUpgrade}
                    className="flex-1 px-8 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    Upgrade to Pro - $29.99/month
                  </button>
                  <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/30 transition-all">
                    See All Plans
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        {isPremium && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Eye className="w-6 h-6 text-purple-500" />}
              label="Profile Views"
              value="1,234"
              trend="+12%"
            />
            <StatCard
              icon={<Heart className="w-6 h-6 text-pink-500" />}
              label="Likes Received"
              value={currentUser?.likeCount.toString() || '0'}
              trend="+8%"
            />
            <StatCard
              icon={<MessageSquare className="w-6 h-6 text-blue-500" />}
              label="Matches"
              value={currentUser?.matchCount.toString() || '0'}
              trend="+15%"
            />
            <StatCard
              icon={<Zap className="w-6 h-6 text-orange-500" />}
              label="Super Likes Left"
              value="5"
              trend="Daily"
            />
          </div>
        )}

        {/* Additional Services */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{service.title}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${service.badgeColor} text-white px-4 py-2 rounded-xl text-sm font-semibold`}>
                    {service.badge}
                  </span>
                  <button className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors">
                    Learn More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">Special Offer! 🎁</h3>
          <p className="text-white/90 text-lg mb-6">
            Get 50% off your first month of Velvii Pro
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
            Claim Offer Now
          </button>
          <p className="text-white/70 text-sm mt-4">Offer expires in 24 hours</p>
        </motion.div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}> = ({ icon, label, value, trend }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
          {trend}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
};
