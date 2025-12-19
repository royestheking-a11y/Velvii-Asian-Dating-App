import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Search, Coffee, Smile, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LookingForPageProps {
    onClose: () => void;
}

const LOOKING_FOR_OPTIONS = [
    { id: 'relationship', label: 'Serious relationship', icon: Heart, color: 'text-red-500' },
    { id: 'casual', label: 'Casual dating', icon: Coffee, color: 'text-orange-500' },
    { id: 'friends', label: 'New friends', icon: Smile, color: 'text-blue-500' },
    { id: 'not_sure', label: 'Not sure yet', icon: Search, color: 'text-purple-500' }
];

export const LookingForPage: React.FC<LookingForPageProps> = ({ onClose }) => {
    const { currentUser, updateCurrentUser } = useAuth();
    const [selected, setSelected] = useState<string>('relationship');

    useEffect(() => {
        if (currentUser && currentUser.lookingFor) {
            setSelected(currentUser.lookingFor);
        }
    }, [currentUser]);

    const handleSave = async () => {
        try {
            await updateCurrentUser({ lookingFor: selected });
            toast.success('Updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between pb-8">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <div className="w-10" />
            </div>

            <div className="flex-1 px-6 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">I'm Looking For</h1>

                <div className="grid grid-cols-2 gap-4 w-full">
                    {LOOKING_FOR_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selected === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setSelected(option.id)}
                                className={`relative rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all border-2 ${isSelected
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                                style={{ aspectRatio: '1/1' }}
                            >
                                <Icon className={`w-8 h-8 ${option.color}`} fill={isSelected ? 'currentColor' : 'none'} />
                                <span className={`text-sm text-center font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

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
