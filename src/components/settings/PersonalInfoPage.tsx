import React, { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/utils/storage';
import { toast } from 'sonner@2.0.3';

interface PersonalInfoPageProps {
  onClose: () => void;
}

export const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({ onClose }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState(currentUser?.gender || 'male');

  if (!currentUser) return null;

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!dateOfBirth) {
      toast.error('Please select your date of birth');
      return;
    }

    // Calculate age
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18) {
      toast.error('You must be at least 18 years old');
      return;
    }

    // Update user
    updateUser(currentUser.id, {
      fullName,
      dateOfBirth,
      gender,
    });

    updateCurrentUser({
      ...currentUser,
      fullName,
      dateOfBirth,
      gender,
    });

    toast.success('Personal information updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl">Personal Information</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-500 text-white rounded-full flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Your age will be publicly displayed
          </p>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGender('male')}
              className={`py-3 rounded-xl transition-all ${
                gender === 'male'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`py-3 rounded-xl transition-all ${
                gender === 'female'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Some information like date of birth cannot be changed frequently. Make sure your information is accurate.
          </p>
        </div>
      </div>
    </div>
  );
};
