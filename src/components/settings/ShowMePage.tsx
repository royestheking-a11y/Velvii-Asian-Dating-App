import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getFilterPreferences, setFilterPreferences } from '@/utils/storage';
import { getDefaultFilters } from '@/utils/helpers';

interface ShowMePageProps {
    onClose: () => void;
}

export const ShowMePage: React.FC<ShowMePageProps> = ({ onClose }) => {
    const { currentUser, updateCurrentUser } = useAuth();

    // Local state for multi-select
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showCisgenderOnly, setShowCisgenderOnly] = useState(false);

    useEffect(() => {
        if (currentUser) {
            // Initialize from showMeCriteria if available (more precise), otherwise fallback to interestedIn
            if (currentUser.showMeCriteria && currentUser.showMeCriteria.length > 0) {
                setSelectedOptions(currentUser.showMeCriteria);
            } else {
                // Fallback mapping
                const current = currentUser.interestedIn;
                if (current === 'men') setSelectedOptions(['man']);
                else if (current === 'women') setSelectedOptions(['woman']);
                else if (current === 'everyone') setSelectedOptions(['everyone']);
            }

            // Check if privacy settings have the new flag
            if (currentUser.settings?.privacy?.showCisgenderOnly !== undefined) {
                setShowCisgenderOnly(currentUser.settings.privacy.showCisgenderOnly);
            }
        }
    }, [currentUser]);

    if (!currentUser) return null;

    const handleOptionClick = (value: string) => {
        if (value === 'everyone') {
            setSelectedOptions(['everyone']);
            return;
        }

        let newOptions: string[];
        if (selectedOptions.includes('everyone')) {
            newOptions = [value];
        } else {
            if (selectedOptions.includes(value)) {
                newOptions = selectedOptions.filter(o => o !== value);
            } else {
                newOptions = [...selectedOptions, value];
            }
        }

        // If nothing selected, maybe default to everyone or keep empty (UI decision)
        if (newOptions.length === 0) newOptions = ['everyone'];

        setSelectedOptions(newOptions);
    };

    const handleSave = async () => {
        // Map selections to backend 'interestedIn'
        let interestedIn: 'men' | 'women' | 'everyone' = 'everyone';

        const hasMan = selectedOptions.includes('man');
        const hasWoman = selectedOptions.includes('woman');
        const hasEveryone = selectedOptions.includes('everyone');

        if (hasEveryone) interestedIn = 'everyone';
        else if (hasMan && hasWoman) interestedIn = 'everyone';
        else if (hasMan && !hasWoman) interestedIn = 'men';
        else if (!hasMan && hasWoman) interestedIn = 'women';
        else interestedIn = 'everyone'; // Fallback

        try {
            // Construct updates object
            const updates: any = {
                interestedIn,
                showMeCriteria: selectedOptions
            };

            // Handle nested settings update safely
            const currentSettings = currentUser.settings || {};
            const currentPrivacy = currentSettings.privacy || {};

            updates.settings = {
                ...currentSettings,
                privacy: {
                    ...currentPrivacy,
                    showCisgenderOnly
                }
            };

            await updateCurrentUser(updates);

            // SYNC FIX: Update local storage filters to match new "Show Me" preference
            // This ensures Discovery page picks up the change immediately
            const currentFilters = getFilterPreferences() || getDefaultFilters();
            setFilterPreferences({
                ...currentFilters,
                gender: interestedIn === 'everyone' ? 'everyone' :
                    interestedIn === 'men' ? 'male' : 'female'
            });

            toast.success('Preferences updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update preferences');
            console.error(error);
        }
    };

    const options = [
        { value: 'man', label: 'Man' },
        { value: 'woman', label: 'Woman' },
        { value: 'everyone', label: 'Everyone' },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Show Me</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-2">
                <div className="space-y-6">
                    {/* Tick List */}
                    <div className="bg-white">
                        {options.map((option) => {
                            const isSelected = selectedOptions.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionClick(option.value)}
                                    className="w-full py-4 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                                >
                                    <span className="text-lg text-gray-900">{option.label}</span>
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'border-gray-200'
                                        }`}>
                                        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Show Cisgender Toggle */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-900 text-lg font-medium">Show cisgender users only</span>
                            <Toggle value={showCisgenderOnly} onChange={setShowCisgenderOnly} />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed pr-8">
                            This means users whose gender matches their sex assigned at birth.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="p-4 safe-area-bottom">
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-orange-500 text-white rounded-full text-lg font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

// Toggle Component (reused for consistency)
const Toggle: React.FC<{ value: boolean; onChange: (val: boolean) => void }> = ({ value, onChange }) => (
    <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
        <motion.div
            className="absolute top-1 bg-white rounded-full shadow-md w-5 h-5"
            animate={{ left: value ? '24px' : '4px' }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </button>
);
