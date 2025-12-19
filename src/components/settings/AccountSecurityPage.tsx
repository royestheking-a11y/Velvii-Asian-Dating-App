import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Smartphone, Mail, Lock, Key, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AccountSecurityPageProps {
    onClose: () => void;
}

export const AccountSecurityPage: React.FC<AccountSecurityPageProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [twoFactor, setTwoFactor] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('velvii_security_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setTwoFactor(parsed.twoFactor ?? false);
            } catch (e) {
                console.error("Failed to parse security settings", e);
            }
        }
    }, []);

    const saveSettings = (updates: { twoFactor: boolean }) => {
        localStorage.setItem('velvii_security_settings', JSON.stringify(updates));
    };

    const handleDeleteAccount = () => {
        // In a real app, this would be a serious API call
        toast.error('Cannot delete account in demo mode');
        setShowDeleteConfirm(false);
    };

    if (!currentUser) return null;

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
                <h1 className="text-xl">Account & Security</h1>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Contact Info */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Login Information</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">

                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-900 mb-1">Email</p>
                                <p className="text-sm text-gray-500">{currentUser.email || 'Not set'}</p>
                            </div>
                            {currentUser.email ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <button className="text-orange-500 text-sm font-medium">Add</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Security</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <button
                            onClick={() => toast.info('Change password flow coming soon')}
                            className="w-full p-4 flex items-center justify-between border-b border-gray-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </button>

                        <ToggleItem
                            icon={<Shield className="w-5 h-5" />}
                            iconBg="bg-green-500"
                            title="Two-Factor Authentication"
                            subtitle="Add an extra layer of security"
                            value={twoFactor}
                            onChange={(val) => {
                                setTwoFactor(val);
                                saveSettings({ twoFactor: val });
                            }}
                        />
                    </div>
                </div>

                {/* Linked Accounts */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Linked Accounts</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                </div>
                                <span className="text-gray-900 font-medium">Google</span>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                                Connected
                            </span>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <div className="w-5 h-5 bg-blue-600 rounded-sm" />
                                </div>
                                <span className="text-gray-900 font-medium">Facebook</span>
                            </div>
                            <button className="text-orange-500 text-sm font-medium">Connect</button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div>
                    <h3 className="text-sm text-red-600 mb-3 px-2">Danger Zone</h3>
                    <div className="bg-white rounded-2xl overflow-hidden border border-red-100">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-red-500 font-medium">Delete Account</p>
                                    <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        onClick={() => setShowDeleteConfirm(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500 ml-1" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Delete Account?
                            </h3>

                            <p className="text-sm text-gray-500 mb-6">
                                This action cannot be undone. All your matches, messages, and settings will be permanently lost.
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Toggle Item & Toggle - Reusing the same pattern (should be a shared component ideally, but duplicating for speed/isolation in this context unless refactoring)
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
