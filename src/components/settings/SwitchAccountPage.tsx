import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, User as UserIcon, Check, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { toast } from 'sonner';

interface SwitchAccountPageProps {
    onClose: () => void;
}

export const SwitchAccountPage: React.FC<SwitchAccountPageProps> = ({ onClose }) => {
    const { currentUser, login, logout } = useAuth();
    const [savedAccounts, setSavedAccounts] = useState<User[]>([]);

    useEffect(() => {
        // Load saved accounts
        try {
            const saved = localStorage.getItem('velvii_saved_accounts');
            let accounts: User[] = saved ? JSON.parse(saved) : [];

            // Ensure current user is in the saved list if not already
            if (currentUser) {
                const exists = accounts.find(u => u.id === currentUser.id);
                if (!exists) {
                    accounts.push(currentUser);
                    localStorage.setItem('velvii_saved_accounts', JSON.stringify(accounts));
                } else {
                    // Update current user data in saved accounts
                    accounts = accounts.map(u => u.id === currentUser.id ? currentUser : u);
                    localStorage.setItem('velvii_saved_accounts', JSON.stringify(accounts));
                }
            }
            setSavedAccounts(accounts);
        } catch (e) {
            console.error("Error loading saved accounts", e);
        }
    }, [currentUser]);

    const handleSwitch = (user: User) => {
        if (user.id === currentUser?.id) return;

        // Switch immediately
        login(user);
        onClose();
        toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
    };

    const handleAddAccount = () => {
        // To add an account, we essentially logout the current one (keeping it saved)
        // and let the user log in as someone new.

        // 1. Ensure current user is saved (already done in useEffect)

        // 2. Logout
        toast.info('Logging out to add new account...');
        setTimeout(() => {
            logout();
            onClose();
        }, 500);
    };

    const handleRemoveAccount = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        const newAccounts = savedAccounts.filter(u => u.id !== userId);
        setSavedAccounts(newAccounts);
        localStorage.setItem('velvii_saved_accounts', JSON.stringify(newAccounts));

        if (currentUser?.id === userId) {
            // If removing current, logout
            logout();
            onClose();
        }
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
                <h1 className="text-xl">Switch Account</h1>
            </div>

            <div className="p-4">
                <p className="text-gray-500 mb-4 px-2">
                    Select an account to switch to or add a new one.
                </p>

                <div className="space-y-3">
                    {savedAccounts.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleSwitch(user)}
                            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${currentUser?.id === user.id
                                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                                : 'border-gray-200 bg-white hover:border-orange-200'
                                }`}
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                {user.photos && user.photos.length > 0 ? (
                                    <img src={user.photos[0]} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>

                            {/* Status/Action */}
                            {currentUser?.id === user.id ? (
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                    <Check className="w-5 h-5" />
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleRemoveAccount(e, user.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove account"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Account Button */}
                    <button
                        onClick={handleAddAccount}
                        className="w-full p-4 rounded-xl border border-dashed border-gray-300 flex items-center gap-4 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-orange-500 transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Add New Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
