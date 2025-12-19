import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, ChevronRight, ChevronLeft, Check, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth as authApi } from '@/services/api';
import { compressImage, generateVelviiId, calculateAge } from '@/utils/helpers';
import { LocationService } from '@/utils/location';
import { getAllUsers } from '@/utils/storage';

interface RegistrationData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'men' | 'women' | 'everyone';
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isAutoLocation?: boolean;
  photos: string[];
}

export const RegistrationFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get initial data from multiple sources to be robust
  const stateEmail = location.state?.email || '';
  const statePassword = location.state?.password || '';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    email: stateEmail,
    password: statePassword,
    username: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    interestedIn: 'women',
    location: {
      city: '',
      country: '',
    },
    photos: [],
  });

  useEffect(() => {
    if (!stateEmail || !statePassword) {
      // Redirect back if accessed directly without state
      // But verify if we already have it in state (e.g. from hot reload or browser back)
      if (!data.email) {
        navigate('/signup');
      }
    }
  }, [stateEmail, statePassword, navigate, data.email]);

  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocation = async () => {
    setIsLocating(true);
    try {
      const position = await LocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const locationData = await LocationService.reverseGeocode(latitude, longitude);

      updateData({
        location: {
          city: locationData.city,
          country: locationData.country,
          coordinates: { lat: latitude, lng: longitude }
        },
        isAutoLocation: true
      });

      toast.success('Location found!');
    } catch (error) {
      console.error(error);
      toast.error('Could not get your location. Please enter manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const updateData = (updates: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    // Validate current step
    if (step === 1 && !data.username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (step === 2 && !data.dateOfBirth) {
      toast.error('Please select your date of birth');
      return;
    }
    if (step === 4 && (!data.location.city || !data.location.country)) {
      toast.error('Please enter your location');
      return;
    }
    if (step === 5 && data.photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final Step: Submit Registration
      await handleCompleteRegistration();
    }
  };

  const handleCompleteRegistration = async () => {
    // Validate age (must be 18+)
    const birthDate = new Date(data.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      toast.error('You must be at least 18 years old to use Velvii');
      return;
    }

    try {
      setIsSubmitting(true);

      const userData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        username: data.username,
        dateOfBirth: data.dateOfBirth,
        age: calculateAge(data.dateOfBirth),
        gender: data.gender,
        interestedIn: data.interestedIn,
        photos: data.photos,
        location: data.location,
        isVerified: false,
        isOnline: true,
        lastActive: new Date().toISOString(),
        isPremium: false,
        instantCircleEnabled: false,
        friendzoneModeEnabled: false,
      };

      const newUser = await authApi.signup(userData);
      login(newUser);
      toast.success("Account created successfully!");
      navigate('/app');

    } catch (error: any) {
      console.error("Signup Error", error);
      toast.error(error.response?.data?.error || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/signup');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real app, you'd upload to a server
    // Use compressImage to avoid localStorage quota issues
    Array.from(files).forEach((file) => {
      compressImage(file)
        .then((result) => {
          setData((prev) => ({
            ...prev,
            photos: [...prev.photos, result],
          }));
          toast.success('Image uploaded successfully');
        })
        .catch(() => {
          toast.error('Failed to process image');
        });
    });
  };

  const removePhoto = (index: number) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            VELVII
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Username & Full Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-2">What's your name?</h2>
                  <p className="text-gray-600">This will be shown on your profile</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={data.fullName}
                      onChange={(e) => {
                        const name = e.target.value;
                        updateData({ fullName: name });
                      }}
                      onBlur={() => {
                        if (data.fullName.trim()) {
                          const users = getAllUsers();
                          const existingUsernames = users.map(u => u.username);
                          const newId = generateVelviiId(data.fullName, existingUsernames);
                          updateData({ username: newId });
                        }
                      }}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Velvii ID (Auto-generated)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={data.username}
                        readOnly
                        placeholder="Your Velvii ID will appear here"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 focus:outline-none cursor-not-allowed"
                      />
                      {data.username && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This is your unique creative username</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Date of Birth */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-2">When's your birthday?</h2>
                  <p className="text-gray-600">You must be 18+ to use Velvii</p>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => updateData({ dateOfBirth: e.target.value })}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Gender & Interest */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-2">Tell us about yourself</h2>
                  <p className="text-gray-600">This helps us show you relevant matches</p>
                </div>

                <div className="space-y-6">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-700">I am a</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['male', 'female', 'other'] as const).map((gender) => (
                        <button
                          key={gender}
                          onClick={() => updateData({ gender })}
                          className={`py-4 px-6 rounded-xl border-2 transition-all ${data.gender === gender
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <div className="text-center capitalize">{gender}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interested In */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-700">Interested in</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: 'women', label: 'Women' },
                        { value: 'men', label: 'Men' },
                        { value: 'everyone', label: 'Everyone' },
                      ] as const).map((interest) => (
                        <button
                          key={interest.value}
                          onClick={() => updateData({ interestedIn: interest.value })}
                          className={`py-4 px-6 rounded-xl border-2 transition-all ${data.interestedIn === interest.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <div className="text-center">{interest.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-2">Where are you located?</h2>
                  <p className="text-gray-600">We'll show you people nearby</p>
                </div>

                <button
                  onClick={handleAutoLocation}
                  disabled={isLocating}
                  className="w-full py-4 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors mb-4 disabled:opacity-50"
                  type="button"
                >
                  {isLocating ? (
                    <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={data.location.city}
                        onChange={(e) => updateData({ location: { ...data.location, city: e.target.value } })}
                        placeholder="e.g., San Francisco"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Country</label>
                    <input
                      type="text"
                      value={data.location.country}
                      onChange={(e) => updateData({ location: { ...data.location, country: e.target.value } })}
                      placeholder="e.g., United States"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Photos */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-2">Add your photos</h2>
                  <p className="text-gray-600">Upload at least 1 photo to continue (max 6)</p>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Uploaded Photos */}
                  {data.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload Button */}
                  {data.photos.length < 6 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all bg-gray-50 hover:bg-orange-50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload</span>
                    </label>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Photo Tips:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Use clear, recent photos</li>
                        <li>• Show your face clearly</li>
                        <li>• Add variety (close-up, full body, activities)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="text-lg">{step === 5 ? 'Complete Profile' : 'Continue'}</span>
                {step === 5 ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
