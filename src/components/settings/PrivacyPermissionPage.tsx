import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Eye, Users, Image, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PrivacyPermissionPageProps {
  onClose: () => void;
}

export const PrivacyPermissionPage: React.FC<PrivacyPermissionPageProps> = ({ onClose }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [hideAge, setHideAge] = useState(false);
  const [hideDistance, setHideDistance] = useState(false);
  const [hideLastSeen, setHideLastSeen] = useState(false);
  const [onlyShowToLiked, setOnlyShowToLiked] = useState(false);
  const [privatePhotos, setPrivatePhotos] = useState(false);

  useEffect(() => {
    if (currentUser?.settings?.privacy) {
      setHideAge(currentUser.settings.privacy.hideAge || false);
      setHideDistance(!currentUser.settings.privacy.showDistance); // Invert showDistance
      setHideLastSeen(!currentUser.settings.privacy.showLastActive); // Invert showLastActive
      setOnlyShowToLiked(currentUser.settings.privacy.onlyShowToLiked || false);
      setPrivatePhotos(currentUser.settings.privacy.privatePhotos || false);
    }
  }, [currentUser]);

  const updatePrivacySetting = (key: string, value: boolean) => {
    if (!currentUser) return;

    // 1. Update local state immediately
    switch (key) {
      case 'hideAge': setHideAge(value); break;
      case 'hideDistance': setHideDistance(value); break;
      case 'hideLastSeen': setHideLastSeen(value); break;
      case 'onlyShowToLiked': setOnlyShowToLiked(value); break;
      case 'privatePhotos': setPrivatePhotos(value); break;
    }

    // 2. Map UI keys to Backend keys
    // hideDistance (UI) -> showDistance (Backend, inverted)
    // hideLastSeen (UI) -> showLastActive (Backend, inverted)
    let backendKey = key;
    let backendValue = value;

    if (key === 'hideDistance') {
      backendKey = 'showDistance';
      backendValue = !value;
    } else if (key === 'hideLastSeen') {
      backendKey = 'showLastActive';
      backendValue = !value;
    }

    const updatedSettings = {
      ...currentUser.settings,
      privacy: {
        ...currentUser.settings?.privacy,
        [backendKey]: backendValue
      }
    };

    updateCurrentUser({ settings: updatedSettings });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl">Privacy & Permission</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Profile Privacy */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Profile Privacy</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Eye className="w-5 h-5" />}
              iconBg="bg-blue-500"
              title="Hide Age"
              subtitle="Don't show my age on my profile"
              value={hideAge}
              onChange={(val) => updatePrivacySetting('hideAge', val)}
            />
            <ToggleItem
              icon={<Lock className="w-5 h-5" />}
              iconBg="bg-purple-500"
              title="Hide Distance"
              subtitle="Don't show my distance on my profile"
              value={hideDistance}
              onChange={(val) => updatePrivacySetting('hideDistance', val)}
            />
          </div>
        </div>

        {/* Status Privacy */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2 flex items-center justify-between">
            <span>Status Privacy</span>
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">VIP</span>
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Clock className="w-5 h-5" />}
              iconBg="bg-green-500"
              title="Hide Last Seen"
              subtitle="People can't see when you're online"
              value={hideLastSeen}
              onChange={(val) => {
                if (!currentUser?.isPremium) {
                  toast.error('This is a Premium feature!', { icon: '👑' });
                  return;
                }
                updatePrivacySetting('hideLastSeen', val);
              }}
            />
          </div>
        </div>

        {/* Discovery Settings */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Discovery Settings</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Users className="w-5 h-5" />}
              iconBg="bg-orange-500"
              title="Only Show to People I've Liked"
              subtitle="Your profile will only be visible to people you've liked"
              value={onlyShowToLiked}
              onChange={(val) => updatePrivacySetting('onlyShowToLiked', val)}
            />
          </div>
        </div>

        {/* Photo Privacy */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Photo Privacy</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Image className="w-5 h-5" />}
              iconBg="bg-pink-500"
              title="Private Photos"
              subtitle="Make some photos visible only to matches"
              value={privatePhotos}
              onChange={(val) => updatePrivacySetting('privatePhotos', val)}
            />
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Contacts</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <button
              onClick={() => toast.info('Contact sync coming soon')}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900">Sync Contacts</p>
                  <p className="text-sm text-gray-500">Find friends on Velvii</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                Off
              </div>
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-900">
            <strong>Privacy First:</strong> Your privacy is important to us. You have full control over who sees your profile and information.
          </p>
        </div>
      </div>
    </div>
  );
};

// Toggle Item Component
interface ToggleItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onChange,
}) => {
  return (
    <div className="p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
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
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-orange-500' : 'bg-gray-300'
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
