import React, { useState, useEffect } from 'react';
import { Crown, Save, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { getFromStorage, setToStorage } from '@/utils/storage';
import { toast } from 'sonner';

interface ProPackage {
  id: string;
  name: string;
  price: number;
  duration: string; // 'weekly' | 'monthly' | 'yearly'
  features: string[];
  isActive: boolean;
}

const STORAGE_KEY = 'velvii_pro_packages';

const defaultPackages: ProPackage[] = [
  {
    id: 'weekly',
    name: 'Pro Weekly',
    price: 9.99,
    duration: 'weekly',
    features: [
      '7 Days Access',
      'Unlimited Likes',
      'See Who Likes You',
      'Premium Badge',
      'Ad-Free Experience',
      'Cancel Anytime',
    ],
    isActive: true,
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 29.99,
    duration: 'monthly',
    features: [
      'Unlimited Likes',
      'See Who Likes You',
      'Super Likes (5/day)',
      'Boost Profile (1/month)',
      'Premium Badge',
      'Ad-Free Experience',
    ],
    isActive: true,
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 99.99,
    duration: 'yearly',
    features: [
      'All Monthly Features',
      '67% Discount',
      'Super Likes (10/day)',
      'Boost Profile (2/month)',
      'Priority Support',
      'Early Access to Features',
    ],
    isActive: true,
  },
];

export const SettingsSection: React.FC = () => {
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<ProPackage | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    const stored = getFromStorage(STORAGE_KEY, defaultPackages);
    setPackages(stored);
  };

  const savePackages = (updatedPackages: ProPackage[]) => {
    setToStorage(STORAGE_KEY, updatedPackages);
    setPackages(updatedPackages);
  };

  const handleSavePackage = (pkg: ProPackage) => {
    const updated = packages.map(p => p.id === pkg.id ? pkg : p);
    if (!packages.find(p => p.id === pkg.id)) {
      updated.push(pkg);
    }
    savePackages(updated);
    setEditingPackage(null);
    setIsCreatingNew(false);
    toast.success('Package updated successfully!');
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const updated = packages.filter(p => p.id !== id);
      savePackages(updated);
      toast.success('Package deleted successfully');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = packages.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    savePackages(updated);
    toast.success('Package status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Package Settings</h3>
            <p className="text-gray-400">
              Configure premium subscription packages, pricing, and features
            </p>
          </div>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Package
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${pkg.isActive ? 'border-green-500/30' : 'border-white/10'
              }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{pkg.duration}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${pkg.isActive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
                }`}>
                {pkg.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">${pkg.price}</span>
                <span className="text-gray-400">/{pkg.duration === 'weekly' ? 'wk' : pkg.duration === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <ul className="space-y-2">
                {pkg.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1 h-1 bg-orange-400 rounded-full" />
                    {feature}
                  </li>
                ))}
                {pkg.features.length > 4 && (
                  <li className="text-sm text-gray-400">
                    +{pkg.features.length - 4} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPackage(pkg)}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(pkg.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${pkg.isActive
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
              >
                {pkg.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDeletePackage(pkg.id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {(editingPackage || isCreatingNew) && (
        <PackageEditModal
          package={editingPackage || {
            id: `pkg_${Date.now()}`,
            name: '',
            price: 0,
            duration: 'monthly',
            features: [],
            isActive: true,
          }}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null);
            setIsCreatingNew(false);
          }}
        />
      )}

      {/* Revenue Impact */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Projection</h3>
            <p className="text-sm text-green-200">Based on current packages</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">${packages.find(p => p.duration === 'monthly')?.price || 0}</div>
            <div className="text-sm text-gray-300">Monthly Plan</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">${packages.find(p => p.duration === 'yearly')?.price || 0}</div>
            <div className="text-sm text-gray-300">Yearly Plan</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{packages.filter(p => p.isActive).length}</div>
            <div className="text-sm text-gray-300">Active Packages</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{packages.length}</div>
            <div className="text-sm text-gray-300">Total Packages</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Package Edit Modal Component
const PackageEditModal: React.FC<{
  package: ProPackage;
  onSave: (pkg: ProPackage) => void;
  onCancel: () => void;
}> = ({ package: pkg, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProPackage>(pkg);
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">
          {pkg.id.startsWith('pkg_') ? 'Create Package' : 'Edit Package'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Package Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-sm lg:text-base text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Pro Monthly"
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-sm lg:text-base text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-sm lg:text-base text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-sm lg:text-base text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Features</label>
            <div className="space-y-2 mb-3">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 lg:p-3">
                  <span className="flex-1 text-xs lg:text-sm text-white">{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3 lg:w-4 h-3 lg:h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                className="flex-1 px-3 lg:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs lg:text-sm text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Add a feature..."
              />
              <button
                onClick={handleAddFeature}
                className="px-3 lg:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs lg:text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl text-sm lg:text-base font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 lg:w-5 h-4 lg:h-5" />
              Save Package
            </button>
            <button
              onClick={onCancel}
              className="px-4 lg:px-6 py-2 lg:py-3 bg-white/10 text-white rounded-xl text-sm lg:text-base font-medium hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};