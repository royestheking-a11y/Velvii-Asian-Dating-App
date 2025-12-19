import React, { useState } from 'react';
import { Camera, Calendar, MapPin, Briefcase, Heart, Sparkles, ArrowRight, ArrowLeft, Check, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INTEREST_TAGS } from '@/types';
import { calculateAge } from '@/utils/helpers';
import { LocationService } from '@/utils/location';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth as authApi } from '@/services/api';
import { toast } from 'sonner';

export interface ProfileData {
  username: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'men' | 'women' | 'everyone';
  bio: string;
  interests: string[];
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  job?: string;
  education?: string;
  height?: number;
}

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // If we ever use this, we'd grab initial data from state or context
  const initialData = location.state?.initialData || { email: '', fullName: '' };

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    interests: [],
  });

  const totalSteps = 5;

  const updateData = (data: Partial<ProfileData>) => {
    setProfileData({ ...profileData, ...data });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete profile setup
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Since this component seems unused in main flow, we'll just log or navigate home
    console.log('Profile setup complete', profileData);
    navigate('/app');
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!profileData.username && profileData.username.length >= 3;
      case 2:
        return !!profileData.dateOfBirth && !!profileData.gender;
      case 3:
        return !!profileData.interestedIn;
      case 4:
        return (profileData.interests?.length || 0) >= 3;
      case 5:
        return !!profileData.city && !!profileData.country;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1
                key="step1"
                fullName={initialData.fullName}
                username={profileData.username || ''}
                onUpdate={updateData}
              />
            )}
            {step === 2 && (
              <Step2
                key="step2"
                dateOfBirth={profileData.dateOfBirth || ''}
                gender={profileData.gender}
                onUpdate={updateData}
              />
            )}
            {step === 3 && (
              <Step3
                key="step3"
                interestedIn={profileData.interestedIn}
                onUpdate={updateData}
              />
            )}
            {step === 4 && (
              <Step4
                key="step4"
                interests={profileData.interests || []}
                onUpdate={updateData}
              />
            )}
            {step === 5 && (
              <Step5
                key="step5"
                city={profileData.city || ''}
                country={profileData.country || ''}
                job={profileData.job || ''}
                bio={profileData.bio || ''}
                onUpdate={updateData}
              />
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${canProceed()
                ? 'gradient-primary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {step === totalSteps ? (
                <>
                  Complete <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Step 1: Username
const Step1: React.FC<{
  fullName: string;
  username: string;
  onUpdate: (data: Partial<ProfileData>) => void;
}> = ({ fullName, username, onUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl mb-2">Choose a username</h2>
      <p className="text-gray-600 mb-6">This is how others will see you</p>

      <div>
        <label className="block mb-2 text-gray-700">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => onUpdate({ username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
          placeholder="cool_username"
        />
        <p className="mt-2 text-sm text-gray-500">Minimum 3 characters, no spaces</p>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600">
          <strong>Hi, {fullName}!</strong> Your username will be visible to all users. Choose something memorable!
        </p>
      </div>
    </motion.div>
  );
};

// Step 2: Birthday & Gender
const Step2: React.FC<{
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other';
  onUpdate: (data: Partial<ProfileData>) => void;
}> = ({ dateOfBirth, gender, onUpdate }) => {
  const age = dateOfBirth ? calculateAge(dateOfBirth) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl mb-2">About you</h2>
      <p className="text-gray-600 mb-6">Tell us your birthday and gender</p>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
          />
          {age > 0 && <p className="mt-2 text-sm text-gray-500">You are {age} years old</p>}
        </div>

        <div>
          <label className="block mb-2 text-gray-700">Gender</label>
          <div className="grid grid-cols-3 gap-3">
            {(['male', 'female', 'other'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onUpdate({ gender: g })}
                className={`py-3 rounded-xl border-2 transition-all ${gender === g
                  ? 'border-[#FF6B6B] bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
        You must be 18+ to use Velvii
      </div>
    </motion.div>
  );
};

// Step 3: Interested In
const Step3: React.FC<{
  interestedIn?: 'men' | 'women' | 'everyone';
  onUpdate: (data: Partial<ProfileData>) => void;
}> = ({ interestedIn, onUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl mb-2">Who are you interested in?</h2>
      <p className="text-gray-600 mb-6">You can change this later</p>

      <div className="space-y-3">
        {(['men', 'women', 'everyone'] as const).map((option) => (
          <button
            key={option}
            onClick={() => onUpdate({ interestedIn: option })}
            className={`w-full py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${interestedIn === option
              ? 'border-[#FF6B6B] bg-[#FF6B6B]/10 text-[#FF6B6B]'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <Heart className={`w-5 h-5 ${interestedIn === option ? 'fill-current' : ''}`} />
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// Step 4: Interests
const Step4: React.FC<{
  interests: string[];
  onUpdate: (data: Partial<ProfileData>) => void;
}> = ({ interests, onUpdate }) => {
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      onUpdate({ interests: interests.filter(i => i !== interest) });
    } else {
      onUpdate({ interests: [...interests, interest] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl mb-2">Your interests</h2>
      <p className="text-gray-600 mb-6">Select at least 3 interests ({interests.length} selected)</p>

      <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
        {INTEREST_TAGS.map((interest) => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full border-2 transition-all ${interests.includes(interest)
              ? 'border-[#FF6B6B] bg-[#FF6B6B] text-white'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {interest}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// Step 5: Location & Bio
const Step5: React.FC<{
  city: string;
  country: string;
  job: string;
  bio: string;
  onUpdate: (data: Partial<ProfileData>) => void;
}> = ({ city, country, job, bio, onUpdate }) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocation = async () => {
    setIsLocating(true);
    try {
      const position = await LocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const data = await LocationService.reverseGeocode(latitude, longitude);

      onUpdate({
        city: data.city,
        country: data.country,
        coordinates: { lat: latitude, lng: longitude }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl mb-2">Final touches</h2>
      <p className="text-gray-600 mb-6">Tell us where you are</p>

      <button
        onClick={handleAutoLocation}
        disabled={isLocating}
        type="button"
        className="w-full py-4 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors mb-4 disabled:opacity-50"
      >
        {isLocating ? (
          <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <Navigation className="w-5 h-5" />
        )}
        <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
      </button>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-700">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => onUpdate({ country: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              placeholder="USA"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">Job (Optional)</label>
          <input
            type="text"
            value={job}
            onChange={(e) => onUpdate({ job: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
            placeholder="Software Engineer"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700">Bio (Optional)</label>
          <textarea
            value={bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="mt-1 text-xs text-gray-500">{bio.length}/500</p>
        </div>
      </div>
    </motion.div>
  );
};
