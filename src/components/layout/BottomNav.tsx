import React from 'react';
import { Heart, MessageCircle, User, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavProps {
  matchCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ matchCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/app/matches')) return 'matches';
    if (path.includes('/app/profile')) return 'profile';
    return 'discover';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'discover', icon: Flame, label: 'Discover', path: '/app' },
    { id: 'matches', icon: MessageCircle, label: 'Matches', badge: matchCount, path: '/app/matches' },
    { id: 'profile', icon: User, label: 'Profile', path: '/app/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeCount = tab.badge || 0;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex-1 flex flex-col items-center py-2 transition-all"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${isActive ? 'text-[#FF6B6B]' : 'text-gray-400'
                    }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {badgeCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </motion.div>
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${isActive ? 'text-[#FF6B6B]' : 'text-gray-400'
                  }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF6B6B] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
