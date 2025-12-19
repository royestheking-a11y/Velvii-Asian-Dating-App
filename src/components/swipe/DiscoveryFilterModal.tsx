import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FilterState {
    distance: number[];
    ageRange: [number, number];
    gender: 'male' | 'female' | 'everyone';
    verifiedOnly: boolean;
    hasBio: boolean;
    onlineNow: boolean;
}

interface DiscoveryFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
}

export const DiscoveryFilterModal: React.FC<DiscoveryFilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    initialFilters
}) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters({
            distance: [50],
            ageRange: [18, 50],
            gender: 'everyone',
            verifiedOnly: false,
            hasBio: false,
            onlineNow: false
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                            <h2 className="text-lg font-bold text-gray-900">Discovery Settings</h2>
                            <button
                                onClick={handleClear}
                                className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Distance */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900">Maximum Distance</h3>
                                    <span className="text-gray-500 font-medium">{filters.distance[0]} km</span>
                                </div>
                                <Slider
                                    defaultValue={[filters.distance[0]]}
                                    value={filters.distance}
                                    max={200}
                                    step={1}
                                    onValueChange={(val: number[]) => setFilters(prev => ({ ...prev, distance: val }))}
                                    className="py-4"
                                />
                            </div>

                            <Separator />

                            {/* Age Range */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900">Age Range</h3>
                                    <span className="text-gray-500 font-medium">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
                                </div>
                                <Slider
                                    defaultValue={filters.ageRange}
                                    value={filters.ageRange}
                                    min={18}
                                    max={100}
                                    step={1}
                                    minStepsBetweenThumbs={1}
                                    onValueChange={(val: number[]) => setFilters(prev => ({ ...prev, ageRange: val as [number, number] }))} className="py-4"
                                />
                            </div>

                            <Separator />

                            {/* Verified Only */}
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-semibold text-gray-900">Verified Profiles Only</h3>
                                    <p className="text-sm text-gray-500">Only show users with verified photos</p>
                                </div>
                                <Switch
                                    checked={filters.verifiedOnly}
                                    onCheckedChange={(checked: boolean) => setFilters(prev => ({ ...prev, verifiedOnly: checked }))}
                                />
                            </div>

                            {/* Bio Required */}
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-semibold text-gray-900">Has Bio</h3>
                                    <p className="text-sm text-gray-500">Only show users who wrote a bio</p>
                                </div>
                                <Switch
                                    checked={filters.hasBio}
                                    onCheckedChange={(checked: boolean) => setFilters(prev => ({ ...prev, hasBio: checked }))}
                                />
                            </div>

                            {/* Online Now */}
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-semibold text-gray-900">Online Recently</h3>
                                    <p className="text-sm text-gray-500">Active within last 24h</p>
                                </div>
                                <Switch
                                    checked={filters.onlineNow}
                                    onCheckedChange={(checked: boolean) => setFilters(prev => ({ ...prev, onlineNow: checked }))}
                                />
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                            <Button
                                onClick={handleApply}
                                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20"
                            >
                                Apply Filters
                            </Button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
