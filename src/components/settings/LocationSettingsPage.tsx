import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Navigation, Search, Check, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LocationService, LocationResult } from '@/utils/location';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface LocationSettingsPageProps {
    onClose: () => void;
}

export const LocationSettingsPage: React.FC<LocationSettingsPageProps> = ({ onClose }) => {
    const { currentUser, updateCurrentUser } = useAuth();
    const [isAuto, setIsAuto] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ city: string; country: string; coordinates?: { lat: number; lng: number } } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setIsAuto(currentUser.isAutoLocation || false);
            setCurrentLocation(currentUser.location);
        }
    }, [currentUser]);

    const handleAutoToggle = async (enabled: boolean) => {
        setIsAuto(enabled);
        if (enabled) {
            // Trigger auto-location fetch
            await fetchCurrentLocation();
        }
    };

    const fetchCurrentLocation = async () => {
        setIsLocating(true);
        try {
            const position = await LocationService.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            const data = await LocationService.reverseGeocode(latitude, longitude);

            setCurrentLocation({
                city: data.city,
                country: data.country,
                coordinates: { lat: latitude, lng: longitude }
            });
            toast.success('Location updated to current position');
        } catch (error) {
            console.error(error);
            toast.error('Failed to get location. Please ensure permission is granted.');
            setIsAuto(false); // Revert if failed
        } finally {
            setIsLocating(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await LocationService.searchCities(query);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectLocation = (result: LocationResult) => {
        setCurrentLocation({
            city: result.city,
            country: result.country,
            coordinates: { lat: result.lat, lng: result.lng }
        });
        setSearchQuery('');
        setSearchResults([]);
        toast.success(`Selected ${result.city}, ${result.country}`);
    };

    const handleSave = () => {
        if (!currentLocation) return;

        updateCurrentUser({
            location: currentLocation,
            isAutoLocation: isAuto
        });
        onClose();
        toast.success('Location settings saved');
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
                <h1 className="text-xl font-semibold">Location Settings</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-6">

                {/* Current Location Display */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wider mb-1">Current Location</p>
                        <h2 className="text-lg font-bold text-gray-900">
                            {currentLocation ? `${currentLocation.city}, ${currentLocation.country}` : 'Not set'}
                        </h2>
                        {isAuto && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                <Navigation className="w-3 h-3" />
                                <span>Auto-detected</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mode Toggle */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Location Mode</h3>
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => handleAutoToggle(true)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${isAuto ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {isLocating ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Navigation className="w-4 h-4" />}
                            Auto Location
                        </button>
                        <button
                            onClick={() => handleAutoToggle(false)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${!isAuto ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            Manual
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-1">
                        {isAuto
                            ? "Your location will automatically update as you travel."
                            : "Choose a specific location to appear in. Great for planning trips!"}
                    </p>
                </div>

                {/* Manual Search */}
                <AnimatePresence>
                    {!isAuto && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search city..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 max-h-60 overflow-y-auto shadow-sm">
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => selectLocation(result)}
                                            className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">{result.city}</div>
                                                <div className="text-xs text-gray-500">{result.country}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};
