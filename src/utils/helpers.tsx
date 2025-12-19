// Helper utilities for Velvii

import { User, FilterPreferences } from '@/types';

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Format distance
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return 'Less than 1 km away';
  } else if (km === 1) {
    return '1 km away';
  } else if (km < 100) {
    return `${km} km away`;
  } else {
    return '100+ km away';
  }
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (seconds < 60) {
    return 'Just now';
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);

    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return 'Just now';
};

// Format last active
export const formatLastActive = (lastActive: string, isOnline: boolean): string => {
  if (isOnline) {
    return 'Online now';
  }

  return formatTimeAgo(lastActive);
};

// Format message time
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Check if user matches filters
export const matchesFilters = (
  user: User,
  currentUser: User,
  filters: FilterPreferences
): boolean => {
  // Age filter
  if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) {
    return false;
  }

  // Gender filter
  if (filters.gender !== 'everyone') {
    if (filters.gender === 'male' && user.gender !== 'male') return false;
    if (filters.gender === 'female' && user.gender !== 'female') return false;
  }

  // Check if user is interested in current user's gender
  // Relaxed constraint: Show users even if they aren't strictly looking for current user's gender
  // This allows broader discovery (e.g. searching for friends or testing)
  /* 
  if (user.interestedIn !== 'everyone') {
    if (user.interestedIn === 'men' && currentUser.gender !== 'male') return false;
    if (user.interestedIn === 'women' && currentUser.gender !== 'female') return false;
  }
  */

  // Online filter
  if (filters.onlineOnly && !user.isOnline) {
    return false;
  }

  // Verified filter
  if (filters.verifiedOnly && !user.isVerified) {
    return false;
  }

  // Distance filter (skip for AI users - they're global)
  // AI users should show regardless of distance
  if (!user.isAI && user.location.coordinates && currentUser.location.coordinates) {
    const distance = calculateDistance(
      currentUser.location.coordinates.lat,
      currentUser.location.coordinates.lng,
      user.location.coordinates.lat,
      user.location.coordinates.lng
    );

    if (distance > filters.maxDistance) {
      return false;
    }
  }

  return true;
};

// Get common interests
export const getCommonInterests = (user1: User, user2: User): string[] => {
  return user1.interests.filter(interest => user2.interests.includes(interest));
};

// Shuffle array
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Format price
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Get random item from array
export const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Check if user is premium
export const isPremiumActive = (user: User): boolean => {
  if (!user.isPremium) return false;
  if (!user.premiumUntil) return false;

  return new Date(user.premiumUntil) > new Date();
};

// Get swipe limit for user
export const getSwipeLimit = (user: User): number => {
  return isPremiumActive(user) ? Infinity : 100; // Free users: 100 swipes per day
};

// Get super like limit for user
export const getSuperLikeLimit = (user: User): number => {
  return isPremiumActive(user) ? 10 : 1; // Premium: 10, Free: 1 per day
};

// Format height
export const formatHeight = (cm: number): string => {
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm / 2.54) % 12);
  return `${cm} cm (${feet}'${inches}")`;
};

// Get initials
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Default filter preferences
export const getDefaultFilters = (): FilterPreferences => {
  return {
    ageRange: [18, 50],
    maxDistance: 50,
    gender: 'everyone',
    onlineOnly: false,
    verifiedOnly: false,
    showCommonInterests: true,
  };
};

// Compress image
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Get Zodiac Sign
export const getZodiacSign = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';

  // Use UTC to avoid timezone issues shifting the date
  // Use UTC to avoid timezone issues shifting the date
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // 1-12

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';

  return 'Unknown';
};

// Generate Velvii ID (Unique Username)
export const generateVelviiId = (fullName: string, existingUsernames: string[] = []): string => {
  if (!fullName) return '';

  // Normalize base: lowercase, remove non-alphanumeric
  // "Sunny" -> "sunny"
  // "Md Sunny" -> "mdsunny"
  const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!base) return `user${Math.floor(Math.random() * 10000)}`;

  // Try to generate a unique ID
  // Pattern: base + 2 random chars (e.g., "sunny0e")
  let attempts = 0;
  let id = '';

  while (attempts < 50) {
    // Generate 2 char suffix: 0-9, a-z
    const suffix = Math.random().toString(36).substring(2, 4);
    id = `${base}${suffix}`;

    if (!existingUsernames.includes(id)) {
      return id;
    }
    attempts++;
  }

  // Fallback if unable to find unique in 50 tries (unlikely unless name is very short and namespace crowded)
  return `${base}${Date.now().toString(36).substring(4)}`;
};
