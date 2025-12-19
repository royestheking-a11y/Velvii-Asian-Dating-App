import React, { useState, useEffect } from 'react';
import { Bot, Eye, Edit, Trash2, Plus, Save, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { admin } from '@/services/api';
import { User } from '@/types';
import { toast } from 'sonner';

export const AIProfilesSection: React.FC = () => {
  const [aiUsers, setAiUsers] = useState<User[]>([]);
  const [selectedAI, setSelectedAI] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIProfiles();
  }, []);

  const loadAIProfiles = async () => {
    try {
      setLoading(true);
      const allUsers = await admin.getAllUsers();
      // Filter for AI users (assuming isAI flag exists or specific criteria)
      // If backend doesn't return isAI, we might need to rely on specific username pattern or extra field
      // Assuming isAI boolean is available on User type as per previous code
      const aiProfiles = allUsers.filter(u => u.isAI);
      setAiUsers(aiProfiles);
    } catch (error) {
      console.error("Failed to load AI profiles", error);
      toast.error("Failed to load AI profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async (userId: string, currentStatus: boolean) => {
    try {
      await admin.updateUser(userId, {
        isOnline: !currentStatus,
        lastActive: new Date().toISOString(),
      });
      toast.success(`AI profile ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadAIProfiles();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteAI = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete AI profile "${userName}"?`)) {
      try {
        await admin.deleteUser(userId);
        toast.success('AI profile deleted successfully');
        loadAIProfiles();
      } catch (error) {
        toast.error("Failed to delete profile");
      }
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedAI(user);
    setViewMode('view');
  };

  const handleEditAI = (user: User) => {
    setSelectedAI(user);
    setEditForm(user);
    setViewMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!selectedAI || !selectedAI.id) return;

    try {
      await admin.updateUser(selectedAI.id, {
        ...editForm,
      });

      toast.success('AI profile updated successfully!');
      loadAIProfiles();
      setViewMode(null);
      setSelectedAI(null);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className="text-white text-center py-10">Loading AI Profiles...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">AI User Profiles</h3>
            <p className="text-gray-400">
              Manage AI-generated profiles that help engage new users. Total: {aiUsers.length} profiles
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add AI Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{aiUsers.length}</div>
            <div className="text-sm text-gray-400">Total AI Profiles</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{aiUsers.filter(u => u.isOnline).length}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{aiUsers.filter(u => u.gender === 'female').length}</div>
            <div className="text-sm text-gray-400">Female</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-400">{aiUsers.filter(u => u.gender === 'male').length}</div>
            <div className="text-sm text-gray-400">Male</div>
          </div>
        </div>
      </div>

      {/* AI Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group"
          >
            {/* Profile Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={user.photos && user.photos.length > 0 ? user.photos[0] : 'https://via.placeholder.com/400'}
                alt={user.fullName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {user.isOnline ? (
                  <span className="px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-500/90 backdrop-blur-sm text-white rounded-lg text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>

              {/* AI Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-purple-500/90 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <Bot className="w-3 h-3" />
                  AI
                </span>
              </div>

              {/* Name & Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">{user.fullName}</h3>
                <p className="text-sm text-gray-300">{user.age} • {user.location?.city || 'Unknown'}</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              {/* Actions */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => handleViewDetails(user)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEditAI(user)}
                  className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAI(user.id, user.fullName)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle Status */}
              <button
                onClick={() => handleToggleOnline(user.id, user.isOnline)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${user.isOnline
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
              >
                {user.isOnline ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View/Edit Modal */}
      <AnimatePresence>
        {viewMode && selectedAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewMode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {viewMode === 'view' ? 'AI Profile Details' : 'Edit AI Profile'}
                    </h2>
                    <p className="text-sm text-gray-400">System-generated user</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewMode(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {viewMode === 'view' ? (
                <AIDetailsView user={selectedAI} onEdit={() => setViewMode('edit')} />
              ) : (
                <AIEditForm
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSaveEdit}
                  onCancel={() => setViewMode(null)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Details View Component (Simplistic, can stay similar)
const AIDetailsView: React.FC<{ user: User; onEdit: () => void }> = ({ user, onEdit }) => {
  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex justify-center">
        <img
          src={user.photos && user.photos.length > 0 ? user.photos[0] : 'https://via.placeholder.com/150'}
          alt={user.fullName}
          className="w-40 h-40 rounded-2xl object-cover ring-4 ring-purple-500/30"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <DetailBox label="Full Name" value={user.fullName} />
        <DetailBox label="Username" value={`@${user.username}`} />
        <DetailBox label="Age" value={`${user.age} years`} />
        <DetailBox label="Gender" value={user.gender} />
        <DetailBox label="Location" value={`${user.location?.city || '-'}, ${user.location?.country || '-'}`} />
        <DetailBox label="Status" value={user.isOnline ? 'Active' : 'Inactive'} />
      </div>

      {/* Bio */}
      {user.bio && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Bio</h3>
          <p className="text-white bg-white/5 rounded-xl p-4">{user.bio}</p>
        </div>
      )}

      {/* Interests */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {user.interests && user.interests.map((interest, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
      >
        <Edit className="w-5 h-5" />
        Edit Profile
      </button>
    </div>
  );
};

// AI Edit Form Component
const AIEditForm: React.FC<{
  editForm: Partial<User>;
  setEditForm: (form: Partial<User>) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ editForm, setEditForm, onSave, onCancel }) => {
  const [uploading, setUploading] = useState(false);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await admin.uploadImage(file);

      const currentPhotos = editForm.photos || [];
      setEditForm({
        ...editForm,
        photos: [...currentPhotos, url],
      });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (editForm.photos && editForm.photos.length > 0) {
      const updatedPhotos = editForm.photos.filter((_, i) => i !== index);
      setEditForm({
        ...editForm,
        photos: updatedPhotos,
      });
      toast.success('Image removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Images Section */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Profile Images
        </h3>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {editForm.photos && editForm.photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-xl ring-2 ring-white/10"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-md font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upload Button */}
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-400">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={editForm.fullName || ''}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            type="text"
            value={editForm.username || ''}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
          <input
            type="number"
            value={editForm.age || ''}
            onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
          <select
            value={editForm.gender || ''}
            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as User['gender'] })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          value={editForm.bio || ''}
          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-white font-medium capitalize">{value}</div>
    </div>
  );
};
