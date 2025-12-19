import React, { useState } from 'react';
import { Crown, Check, X, Heart, Star, Zap, Eye, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PREMIUM_PLANS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptions as apiSubscriptions } from '@/services/api';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onClose = () => navigate(-1);

  const features = [
    { icon: <Heart className="w-5 h-5" />, text: 'Unlimited Swipes', pro: true },
    { icon: <Eye className="w-5 h-5" />, text: 'See Who Likes You', pro: true },
    { icon: <Star className="w-5 h-5" />, text: 'Super Likes', pro: true },
    { icon: <Zap className="w-5 h-5" />, text: 'Profile Boosts', pro: true },
    { icon: <Globe className="w-5 h-5" />, text: 'Global Location', pro: true },
    { icon: <Sparkles className="w-5 h-5" />, text: 'Instant Circle Access', pro: true },
    { icon: <Check className="w-5 h-5" />, text: 'Ad-Free Experience', pro: true },
    { icon: <Crown className="w-5 h-5" />, text: 'Premium Badge', pro: true },
  ];

  const handleSubscribe = async () => {
    if (!currentUser) return;

    const plan = PREMIUM_PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    try {
      const result = await apiSubscriptions.create({
        userId: currentUser.id,
        plan: plan.id,
        price: plan.price,
        duration: plan.duration
      });

      if (result && result.user) {
        updateCurrentUser(result.user);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Subscription failed", error);
      toast.error("Failed to process subscription");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FF6B6B] via-[#FF8E53] to-[#FF6B6B] overflow-y-auto">
      <div className="min-h-screen p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-8 pt-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl">Upgrade to Pro</h1>
          <div className="w-10" />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center mx-auto mb-6">
            <Crown className="w-12 h-12" />
          </div>
          <h2 className="text-4xl mb-3">Velvii Pro</h2>
          <p className="text-xl text-white/90">Take your dating experience to the next level</p>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8 space-y-3"
        >
          {PREMIUM_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full p-5 rounded-2xl border-2 transition-all ${selectedPlan === plan.id
                ? 'bg-white border-white shadow-xl'
                : 'bg-white/10 backdrop-blur-sm border-white/30 text-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id
                      ? 'border-[#FF6B6B] bg-[#FF6B6B]'
                      : 'border-white/50'
                      }`}
                  >
                    {selectedPlan === plan.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg ${selectedPlan === plan.id ? 'text-gray-900' : ''}`}>
                      {plan.name}
                      {plan.popular && (
                        <span className="ml-2 px-2 py-0.5 bg-[#FF6B6B] text-white text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm ${selectedPlan === plan.id ? 'text-gray-600' : 'text-white/80'}`}>
                      {plan.features.join(' • ')}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${selectedPlan === plan.id ? 'text-gray-900' : ''}`}>
                  <div className="text-2xl">${plan.price}</div>
                  <div className={`text-xs ${selectedPlan === plan.id ? 'text-gray-500' : 'text-white/80'}`}>
                    /{plan.duration === 'yearly' ? 'year' : plan.duration === 'monthly' ? 'month' : 'week'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h3 className="text-white text-xl mb-4">What's included</h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <button
            onClick={handleSubscribe}
            className="w-full py-5 bg-white text-[#FF6B6B] rounded-2xl shadow-2xl hover:shadow-3xl transition-all mb-4"
          >
            <span className="text-lg">Subscribe Now</span>
          </button>

          <p className="text-center text-white/80 text-sm">
            Cancel anytime. By continuing, you agree to our Terms of Service.
          </p>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto mt-8 text-center text-white/60 text-sm space-y-2"
        >
          <p>✓ Secure payment processing</p>
          <p>✓ Over 1M+ happy Pro members</p>
          <p>✓ 30-day money-back guarantee</p>
        </motion.div>
      </div>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-gradient-to-br from-gray-900 to-black w-full max-w-sm rounded-[2rem] p-8 text-center overflow-hidden border border-orange-500/30 shadow-2xl shadow-orange-500/20"
            >
              {/* Confetti / Sparkles Background */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-yellow-400 rounded-full"
                    initial={{
                      x: Math.random() * 300,
                      y: -20,
                      opacity: 1,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                      y: 400,
                      x: Math.random() * 300 + (Math.random() - 0.5) * 100,
                      opacity: 0,
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      repeat: Infinity,
                      ease: "linear",
                      delay: Math.random() * 2
                    }}
                    style={{
                      width: Math.random() * 8 + 4,
                      height: Math.random() * 8 + 4,
                      background: ['#FFD700', '#FFA500', '#FF6B6B'][Math.floor(Math.random() * 3)]
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/40"
              >
                <Crown className="w-14 h-14 text-white drop-shadow-md" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Premium!</h2>
              <p className="text-gray-300 mb-8">
                You've unlocked unlimited access. Get ready for better matches! 🚀
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                LET'S GO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
