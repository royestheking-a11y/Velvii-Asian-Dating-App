import React from 'react';
import { Heart, Sparkles, Shield, Zap, Users, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] via-[#FF8E53] to-[#FF6B6B] overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border-2 border-white/30">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Heart className="w-9 h-9 text-white fill-white" />
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-5xl md:text-6xl tracking-tight">
            Velvii
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Where Connections Feel Premium
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-12 py-4 bg-white text-[#FF6B6B] rounded-full shadow-2xl hover:shadow-3xl transition-all font-semibold"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
        >
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Smart Matching"
            description="AI-powered algorithm to find your perfect match"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Safe & Secure"
            description="Verified profiles and advanced safety features"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Connections"
            description="Meet nearby people looking for the same vibe"
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto text-white text-center"
        >
          <div>
            <div className="text-4xl mb-2">10M+</div>
            <div className="text-white/80">Active Users</div>
          </div>
          <div>
            <div className="text-4xl mb-2">50M+</div>
            <div className="text-white/80">Matches Made</div>
          </div>
          <div>
            <div className="text-4xl mb-2">4.8★</div>
            <div className="text-white/80">App Rating</div>
          </div>
        </motion.div>

        {/* Premium Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 mb-12 max-w-2xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 text-center border-2 border-yellow-300/50 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-3xl mb-3 text-gray-900">Try Velvii Pro</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Unlimited swipes, see who likes you, and access exclusive features
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span>Instant Circle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span>Super Likes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span>Boosts</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-shadow"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8 text-white' })}
        </div>
      </div>
      <h3 className="text-xl mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};