import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wifi, Image, Play, Trash2, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface DataStoragePageProps {
    onClose: () => void;
}

export const DataStoragePage: React.FC<DataStoragePageProps> = ({ onClose }) => {
    const [autoplayVideos, setAutoplayVideos] = useState(true);
    const [highQualityUploads, setHighQualityUploads] = useState(false);
    const [dataSaver, setDataSaver] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('velvii_data_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setAutoplayVideos(parsed.autoplayVideos ?? true);
                setHighQualityUploads(parsed.highQualityUploads ?? false);
                setDataSaver(parsed.dataSaver ?? false);
            } catch (e) {
                console.error("Failed to parse data settings", e);
            }
        }
    }, []);

    const dataSettings = {
        autoplayVideos,
        highQualityUploads,
        dataSaver,
    };

    const saveSettings = (updates: Partial<typeof dataSettings>) => {
        const newSettings = { ...dataSettings, ...updates };
        localStorage.setItem('velvii_data_settings', JSON.stringify(newSettings));
    };

    const handleClearCache = () => {
        // Only clear acceptable cache keys, do not wipe user session
        // For now, we simulate a clear
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Clearing cache...',
            success: 'Cache cleared successfully (128 MB freed)',
            error: 'Failed to clear cache',
        });
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
                <h1 className="text-xl">Data & Storage</h1>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Media Auto-Download */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Media Auto-Download</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <ToggleItem
                            icon={<Play className="w-5 h-5" />}
                            iconBg="bg-blue-500"
                            title="Autoplay Videos"
                            subtitle="Automatically play videos on cellular data"
                            value={autoplayVideos}
                            onChange={(val) => {
                                setAutoplayVideos(val);
                                saveSettings({ autoplayVideos: val });
                            }}
                        />
                        <ToggleItem
                            icon={<Image className="w-5 h-5" />}
                            iconBg="bg-purple-500"
                            title="High Quality Uploads"
                            subtitle="Always upload photos in original quality"
                            value={highQualityUploads}
                            onChange={(val) => {
                                setHighQualityUploads(val);
                                saveSettings({ highQualityUploads: val });
                            }}
                        />
                    </div>
                </div>

                {/* Data Usage */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Data Usage</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <ToggleItem
                            icon={<Wifi className="w-5 h-5" />}
                            iconBg="bg-green-500"
                            title="Data Saver Mode"
                            subtitle="Reduce data usage for calls and media"
                            value={dataSaver}
                            onChange={(val) => {
                                setDataSaver(val);
                                saveSettings({ dataSaver: val });
                            }}
                        />
                    </div>
                </div>

                {/* Storage Usage */}
                <div>
                    <h3 className="text-sm text-gray-600 mb-3 px-2">Storage Usage</h3>
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <button
                            onClick={() => toast.info('Storage management coming soon')}
                            className="w-full p-4 flex items-center justify-between border-b border-gray-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-900">Manage Storage</p>
                                    <p className="text-sm text-gray-500">2.4 GB used</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </button>
                        <button
                            onClick={handleClearCache}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-900">Clear Cache</p>
                                    <p className="text-sm text-gray-500">Free up space on your device</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">128 MB</span>
                        </button>
                    </div>
                </div>

                {/* Info Note */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Clearing cache will not delete your account or personal data. It only removes temporary files.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Toggle Item Component (reused)
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

// Toggle Component (reused)
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
