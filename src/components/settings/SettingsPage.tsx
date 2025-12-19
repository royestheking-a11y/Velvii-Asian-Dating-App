import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, User, Lock, Bell, HardDrive,
  Shield, MessageCircle, Edit, HelpCircle, Share2, Info,
  LogOut, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getFilterPreferences, setFilterPreferences } from '@/utils/storage';
import { getDefaultFilters } from '@/utils/helpers';
import { PersonalInfoPage } from './PersonalInfoPage';
import { PrivacyPermissionPage } from './PrivacyPermissionPage';
import { NotificationChatPage } from './NotificationChatPage';
import { ShowMePage } from './ShowMePage';
import { DataStoragePage } from './DataStoragePage';
import { AccountSecurityPage } from './AccountSecurityPage';
import { FeedbackPage } from './FeedbackPage';
import { SwitchAccountPage } from './SwitchAccountPage';
import { LocationSettingsPage } from './LocationSettingsPage';
import { LookingForPage } from './LookingForPage';

import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateCurrentUser } = useAuth();

  // Load initial preferences from storage or use defaults
  const savedPrefs = getFilterPreferences() || getDefaultFilters();

  const [verifiedOnly, setVerifiedOnly] = useState(savedPrefs.verifiedOnly);
  const [hideLastSeen, setHideLastSeen] = useState(currentUser?.settings?.privacy?.showLastActive !== undefined ? !currentUser.settings.privacy.showLastActive : false);
  const [expandSearchArea, setExpandSearchArea] = useState(true);
  const [distance, setDistance] = useState(savedPrefs.maxDistance);
  const [ageRange, setAgeRange] = useState({ min: savedPrefs.ageRange[0], max: savedPrefs.ageRange[1] });
  const [activeSubPage, setActiveSubPage] = useState<'personalInfo' | 'privacy' | 'notifications' | 'showMe' | 'lookingFor' | 'dataStorage' | 'accountSecurity' | 'feedback' | 'switchAccount' | 'location' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Save preferences when they change
  useEffect(() => {
    if (!currentUser) return;

    setFilterPreferences({
      ...savedPrefs,
      maxDistance: distance,
      ageRange: [ageRange.min, ageRange.max],
      verifiedOnly: verifiedOnly,
      gender: savedPrefs.gender || 'everyone', // Keep existing or default
      onlineOnly: savedPrefs.onlineOnly || false,
      showCommonInterests: savedPrefs.showCommonInterests || true,
    });
  }, [distance, ageRange, verifiedOnly, currentUser]);

  // Sync hideLastSeen from backend when currentUser loads
  useEffect(() => {
    if (currentUser?.settings?.privacy?.showLastActive !== undefined) {
      setHideLastSeen(!currentUser.settings.privacy.showLastActive);
    }
  }, [currentUser]);

  const updatePrivacySettings = async (updates: any) => {
    if (!currentUser) return;
    try {
      const currentSettings = currentUser.settings || {};
      const currentPrivacy = currentSettings.privacy || {};

      await updateCurrentUser({
        settings: {
          ...currentSettings,
          privacy: {
            ...currentPrivacy,
            ...updates
          }
        }
      });
      // toast.success('Privacy settings updated'); // Optional
    } catch (error) {
      toast.error('Failed to update privacy settings');
    }
  };

  if (!currentUser) return null;

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleVerifiedToggle = (checked: boolean) => {
    if (currentUser.isPremium) {
      setVerifiedOnly(checked);
    } else {
      toast.error('Verified filter is for VIP members only!', {
        icon: '👑',
        description: 'Upgrade to filter out unverified profiles.'
      });
    }
  };

  const handleSwitchAccount = () => {
    setActiveSubPage('switchAccount');
  };

  const handleRestorePurchases = () => {
    toast.success('Checking for purchases...');
  };

  // Show sub-pages
  if (activeSubPage === 'personalInfo') {
    return <PersonalInfoPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'privacy') {
    return <PrivacyPermissionPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'notifications') {
    return <NotificationChatPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'showMe') {
    return <ShowMePage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'dataStorage') {
    return <DataStoragePage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'accountSecurity') {
    return <AccountSecurityPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'location') {
    return <LocationSettingsPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'feedback') {
    return <FeedbackPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'switchAccount') {
    return <SwitchAccountPage onClose={() => setActiveSubPage(null)} />;
  }

  if (activeSubPage === 'lookingFor') {
    return <LookingForPage onClose={() => setActiveSubPage(null)} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl">Settings</h1>
      </div>

      {/* Body content omitted for brevity... down to buttons */}
      {/* (I'll use a separate replacement chunk for the buttons to keep context clean if needed, or I can try to match context better) */}
      {/* Actually, let's just do imports and state/render logic first. Then update buttons separately. */}


      <div className="pb-2">
        {/* Discovery Settings Section */}
        <div className="px-4 py-2">
          <span className="text-orange-500">Discovery Settings</span>
        </div>

        <div className="bg-white">
          {/* Location */}
          <button
            onClick={() => setActiveSubPage('location')}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 transition-colors hover:bg-gray-50"
          >
            <span className="text-gray-900">Location</span>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">
                {currentUser.location?.city || 'Customize Location'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Distance */}
        <div className="px-4 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-900">Distance</span>
            <span className="text-orange-500">{distance}km+</span>
          </div>

          {/* Slider Container */}
          <div className="relative h-8 flex items-center">
            {/* Track Background */}
            <div className="w-full h-1 bg-gray-200 rounded-full" />

            {/* Active Track */}
            <div
              className="absolute h-1 bg-orange-500 rounded-full left-0"
              style={{ width: `${(distance / 150) * 100}%` }}
            />

            {/* Slider Input (Invisible but controls interaction) */}
            <input
              type="range"
              min="1"
              max="150"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Visual Thumb */}
            <div
              className="absolute w-5 h-5 bg-orange-500 rounded-full shadow-md pointer-events-none z-10"
              style={{
                left: `calc(${(distance / 150) * 100}% - 10px)`,
                /* No top/translate needed if using flex container centering, 
                   but since it's absolute, we need to center it explicitly relative to container */
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          </div>

          {/* Icons */}
          <div className="flex items-center justify-between mt-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Expand Search Area */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-900">Expand Search Area</span>
            <Toggle value={expandSearchArea} onChange={setExpandSearchArea} />
          </div>
          <p className="text-sm text-gray-400">Automatically expand search radius</p>
        </div>

        {/* Show Me */}
        <button
          onClick={() => setActiveSubPage('showMe')}
          className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 transition-colors hover:bg-gray-50 bg-white"
        >
          <span className="text-gray-900">Show Me</span>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-medium capitalize">
              {currentUser.interestedIn === 'everyone' ? 'Everyone' :
                currentUser.interestedIn === 'men' ? 'Men' : 'Women'}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {/* Age Range */}
        <div className="px-4 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-900">Maximum Age</span>
            <span className="text-orange-500">{ageRange.max}</span>
          </div>

          <div className="relative h-8 flex items-center">
            {/* Track Background */}
            <div className="w-full h-1 bg-gray-200 rounded-full" />

            {/* Active Track */}
            <div
              className="absolute h-1 bg-orange-500 rounded-full left-0"
              style={{ width: `${((ageRange.max - 18) / 62) * 100}%` }}
            />

            {/* Slider Input */}
            <input
              type="range"
              min="18"
              max="80"
              value={ageRange.max}
              onChange={(e) => {
                setAgeRange({ ...ageRange, max: Number(e.target.value) });
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Visual Thumb */}
            <div
              className="absolute w-6 h-6 bg-orange-500 rounded-full shadow-md pointer-events-none z-10 flex items-center justify-center border-2 border-white"
              style={{
                left: `calc(${((ageRange.max - 18) / 62) * 100}% - 12px)`,
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-xs">18</span>
            <span className="text-gray-400 text-xs">80+</span>
          </div>
        </div>

        {/* I'm Looking For */}
        <button
          onClick={() => {
            if (currentUser.isPremium) {
              setActiveSubPage('lookingFor');
            } else {
              toast.error('Upgrade to Premium to set relationship goals!', {
                icon: '👑',
                description: 'This feature is available for VIP members only.'
              });
            }
          }}
          className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 transition-colors hover:bg-gray-50 bg-white"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-900">I'm Looking For</span>
            <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full flex items-center gap-1 shadow-sm">
              <Crown className="w-3 h-3" />
              <span className="font-bold tracking-wide text-[10px]">VIP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-medium capitalize">
              {currentUser.lookingFor ?
                (currentUser.lookingFor === 'relationship' ? 'Serious' :
                  currentUser.lookingFor === 'casual' ? 'Casual' :
                    currentUser.lookingFor === 'friends' ? 'Friends' : 'Not Sure')
                : 'Select'}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {/* Verified Profiles Only */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-gray-900">Verified profiles only</span>
            <div className="w-6 h-6 bg-yellow-900/10 rounded flex items-center justify-center">
              <div className="w-3 h-3 border-l-2 border-b-2 border-yellow-700 rotate-[-45deg] translate-y-[-1px]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser.isPremium && (
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            )}
            <Toggle value={verifiedOnly} onChange={handleVerifiedToggle} />
          </div>
        </div>




      </div>



      {/* Privacy Settings */}
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-orange-500">Privacy Settings</span>
        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded">
          VIP
        </span>
      </div>

      {/* Hide Last Seen */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-900">Hide Last Seen</span>
            <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full flex items-center gap-1 shadow-sm">
              <Crown className="w-3 h-3" />
            </div>
          </div>
          <Toggle
            value={hideLastSeen}
            onChange={(val) => {
              if (currentUser.isPremium) {
                setHideLastSeen(val);
                updatePrivacySettings({ showLastActive: !val });
              } else {
                toast.error('Upgrade to Premium to hide your status!', {
                  icon: '👑'
                });
              }
            }}
          />
        </div>
        <p className="text-sm text-gray-500">People can't see when you're online</p>
      </div>

      <div className="h-4" />

      {/* App Settings */}
      <div className="px-4 py-2">
        <span className="text-orange-500">App Settings</span>
      </div>

      <div className="bg-white">
        <SettingsButton
          icon={<User className="w-5 h-5" />}
          iconBg="bg-blue-500"
          label="Personal Information"
          subtitle="Edit your name and date of birth"
          onClick={() => setActiveSubPage('personalInfo')}
        />

        <SettingsButton
          icon={<Lock className="w-5 h-5" />}
          iconBg="bg-orange-500"
          label="Privacy & Permission"
          subtitle="Contacts and My Album"
          hasVIP
          onClick={() => {
            if (currentUser.isPremium) {
              setActiveSubPage('privacy');
            } else {
              toast.error('Privacy settings are for VIP members only!', {
                icon: '👑'
              });
            }
          }}
        />

        <SettingsButton
          icon={<MessageCircle className="w-5 h-5" />}
          iconBg="bg-green-500"
          label="Notification & Chat"
          subtitle="Chat and notification settings"
          onClick={() => setActiveSubPage('notifications')}
        />

        <SettingsButton
          icon={<HardDrive className="w-5 h-5" />}
          iconBg="bg-gray-500"
          label="Data & Storage"
          subtitle="Data preferences and storage settings"
          onClick={() => setActiveSubPage('dataStorage')}
        />

        <SettingsButton
          icon={<Shield className="w-5 h-5" />}
          iconBg="bg-blue-500"
          label="Account & Security"
          subtitle="Linked Account Management"
          hasNotification
          onClick={() => setActiveSubPage('accountSecurity')}
        />
      </div>

      <div className="h-4" />

      {/* Other Settings */}
      <div className="bg-white">
        <SettingsButton
          icon={<Edit className="w-5 h-5" />}
          iconBg="bg-red-500"
          label="Feedback"
          subtitle="Let us know about your experience on Velvii"
          hasNotification
          onClick={() => setActiveSubPage('feedback')}
        />

        <SettingsButton
          icon={<HelpCircle className="w-5 h-5" />}
          iconBg="bg-gray-500"
          label="Help"
          onClick={() => toast.info('Coming soon')}
        />

        <SettingsButton
          icon={<Share2 className="w-5 h-5" />}
          iconBg="bg-orange-500"
          label="Share Velvii"
          subtitle="Invite your friends to Velvii"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Velvii Dating App',
                text: 'Join me on Velvii!',
                url: window.location.origin,
              });
            } else {
              toast.success('Share link copied!');
            }
          }}
        />

        <SettingsButton
          icon={<Info className="w-5 h-5" />}
          iconBg="bg-cyan-500"
          label="About Velvii"
          subtitle="More information about Velvii"
          onClick={() => toast.info('Velvii v1.0.0')}
        />
      </div>

      <div className="h-6" />

      {/* Action Buttons */}
      <div className="px-4 space-y-3">
        <button
          onClick={handleRestorePurchases}
          className="w-full py-4 bg-white rounded-xl text-orange-500 border border-gray-200"
        >
          RESTORE PURCHASES
        </button>

        <button
          onClick={handleSwitchAccount}
          className="w-full py-4 bg-white rounded-xl text-gray-900 border border-gray-200 flex items-center justify-center gap-2"
        >
          <span>SWITCH ACCOUNT</span>
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-white rounded-xl text-gray-900 border border-gray-200"
        >
          SIGN OUT
        </button>
      </div>

      {/* Version */}
      <div className="text-center mt-8 text-sm text-gray-400">
        Velvii 1.0.0
      </div>


      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {
          showLogoutConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl overflow-hidden"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <LogOut className="w-8 h-8 text-red-500 ml-1" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sign Out of Velvii?
                  </h3>

                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to sign out? You'll need to sign in again to use the app.
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmSignOut}
                      className="px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
    </div >
  );
};

// Settings Button Component
interface SettingsButtonProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle?: string;
  hasVIP?: boolean;
  hasNotification?: boolean;
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  icon,
  iconBg,
  label,
  subtitle,
  hasVIP,
  hasNotification,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 flex items-center gap-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-gray-900">{label}</span>
          {hasVIP && <Crown className="w-4 h-4 text-yellow-600" />}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasNotification && (
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
};

// Toggle Component
interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange }) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-300'
        }`}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{
          left: value ? '24px' : '4px',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  );
};