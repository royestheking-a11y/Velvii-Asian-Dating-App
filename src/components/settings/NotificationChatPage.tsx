import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, MessageCircle, Heart, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface NotificationChatPageProps {
  onClose: () => void;
}

export const NotificationChatPage: React.FC<NotificationChatPageProps> = ({ onClose }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [superLikes, setSuperLikes] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('velvii_notification_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setPushNotifications(parsed.pushNotifications ?? true);
        setNewMatches(parsed.newMatches ?? true);
        setNewMessages(parsed.newMessages ?? true);
        setSuperLikes(parsed.superLikes ?? true);
        setPromotions(parsed.promotions ?? false);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setVibrationEnabled(parsed.vibrationEnabled ?? true);
      } catch (e) {
        console.error("Failed to parse notification settings", e);
      }
    }
  }, []);

  const notificationSettings = {
    pushNotifications,
    newMatches,
    newMessages,
    superLikes,
    promotions,
    soundEnabled,
    vibrationEnabled,
  };

  const saveSettings = (updates: Partial<typeof notificationSettings>) => {
    const newSettings = { ...notificationSettings, ...updates };
    localStorage.setItem('velvii_notification_settings', JSON.stringify(newSettings));
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
        <h1 className="text-xl">Notification & Chat</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Push Notifications */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Push Notifications</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Bell className="w-5 h-5" />}
              iconBg="bg-orange-500"
              title="Push Notifications"
              subtitle="Enable all push notifications"
              value={pushNotifications}
              onChange={(val) => {
                setPushNotifications(val);
                saveSettings({ pushNotifications: val });
              }}
            />
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Notification Types</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Heart className="w-5 h-5" />}
              iconBg="bg-pink-500"
              title="New Matches"
              subtitle="Get notified when you have a new match"
              value={newMatches}
              onChange={(val) => {
                setNewMatches(val);
                saveSettings({ newMatches: val });
              }}
              disabled={!pushNotifications}
            />
            <ToggleItem
              icon={<MessageCircle className="w-5 h-5" />}
              iconBg="bg-blue-500"
              title="New Messages"
              subtitle="Get notified when you receive a message"
              value={newMessages}
              onChange={(val) => {
                setNewMessages(val);
                saveSettings({ newMessages: val });
              }}
              disabled={!pushNotifications}
            />
            <ToggleItem
              icon={<Star className="w-5 h-5" />}
              iconBg="bg-cyan-500"
              title="Super Likes"
              subtitle="Get notified when someone super likes you"
              value={superLikes}
              onChange={(val) => {
                setSuperLikes(val);
                saveSettings({ superLikes: val });
              }}
              disabled={!pushNotifications}
            />
            <ToggleItem
              icon={<Sparkles className="w-5 h-5" />}
              iconBg="bg-yellow-500"
              title="Promotions & Tips"
              subtitle="Get updates about new features and offers"
              value={promotions}
              onChange={(val) => {
                setPromotions(val);
                saveSettings({ promotions: val });
              }}
              disabled={!pushNotifications}
            />
          </div>
        </div>

        {/* Chat Settings */}
        <div>
          <h3 className="text-sm text-gray-600 mb-3 px-2">Chat Settings</h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            <ToggleItem
              icon={<Bell className="w-5 h-5" />}
              iconBg="bg-green-500"
              title="Sound"
              subtitle="Play sound for new messages"
              value={soundEnabled}
              onChange={(val) => {
                setSoundEnabled(val);
                saveSettings({ soundEnabled: val });
              }}
            />
            <ToggleItem
              icon={<Bell className="w-5 h-5" />}
              iconBg="bg-purple-500"
              title="Vibration"
              subtitle="Vibrate for new messages"
              value={vibrationEnabled}
              onChange={(val) => {
                setVibrationEnabled(val);
                saveSettings({ vibrationEnabled: val });
              }}
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Enable notifications to never miss a match or message!
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
  disabled?: boolean;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 ${disabled ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
};

// Toggle Component
interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange, disabled = false }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-orange-500' : 'bg-gray-300'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
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
