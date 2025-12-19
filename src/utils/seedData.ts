// Seed Data for Velvii - AI Users and Initial Data

import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate unique ID (fallback if uuid not available)
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// AI Female Users
export const AI_FEMALE_USERS: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'emma.ai@velvii.app',
    fullName: 'Emma Anderson',
    username: 'emma_adventures',
    dateOfBirth: '1996-05-15',
    age: 28,
    gender: 'female',
    interestedIn: 'men',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
    ],
    bio: "Adventure seeker ✨ Love hiking, photography, and good coffee. Always up for spontaneous road trips! Let's explore together 🌍",
    interests: ['Travel', 'Photography', 'Hiking', 'Coffee', 'Music', 'Yoga'],
    height: 168,
    education: 'Bachelor in Communications',
    job: 'Marketing Manager',
    location: {
      city: 'San Francisco',
      country: 'USA',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    isVerified: true,
    isOnline: true,
    lastActive: new Date().toISOString(),
    isPremium: false,
    instantCircleEnabled: false,
    friendzoneModeEnabled: false,
    swipeCount: 234,
    likeCount: 89,
    matchCount: 45,
    superLikesRemaining: 5,
    boostsRemaining: 0,
    isAI: true,
  },
  {
    email: 'sophia.ai@velvii.app',
    fullName: 'Sophia Chen',
    username: 'sophia_artsy',
    dateOfBirth: '1998-08-22',
    age: 26,
    gender: 'female',
    interestedIn: 'everyone',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    ],
    bio: "Artist & dreamer 🎨 Gallery hopping, indie movies, and late-night conversations. Looking for someone who appreciates art and authenticity 💫",
    interests: ['Art', 'Movies', 'Photography', 'Reading', 'Wine', 'Theater'],
    height: 165,
    education: 'MFA in Fine Arts',
    job: 'Freelance Artist',
    location: {
      city: 'New York',
      country: 'USA',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    isVerified: true,
    isOnline: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isPremium: true,
    instantCircleEnabled: true,
    friendzoneModeEnabled: false,
    swipeCount: 567,
    likeCount: 234,
    matchCount: 78,
    superLikesRemaining: 10,
    boostsRemaining: 3,
    isAI: true,
  },
  {
    email: 'olivia.ai@velvii.app',
    fullName: 'Olivia Martinez',
    username: 'liv_fitness',
    dateOfBirth: '1995-03-10',
    age: 29,
    gender: 'female',
    interestedIn: 'men',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
    ],
    bio: "Fitness enthusiast 💪 Yoga instructor by day, foodie by night. Balanced life is the best life. Swipe right if you love brunch! 🥑",
    interests: ['Fitness', 'Yoga', 'Cooking', 'Foodie', 'Running', 'Beach'],
    height: 172,
    education: 'Certified Yoga Instructor',
    job: 'Yoga Instructor & Wellness Coach',
    location: {
      city: 'Los Angeles',
      country: 'USA',
      coordinates: { lat: 34.0522, lng: -118.2437 },
    },
    isVerified: true,
    isOnline: true,
    lastActive: new Date().toISOString(),
    isPremium: false,
    instantCircleEnabled: false,
    friendzoneModeEnabled: true,
    swipeCount: 423,
    likeCount: 178,
    matchCount: 92,
    superLikesRemaining: 5,
    boostsRemaining: 0,
    isAI: true,
  },
];

// AI Male Users
export const AI_MALE_USERS: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'alex.ai@velvii.app',
    fullName: 'Alex Thompson',
    username: 'alex_tech',
    dateOfBirth: '1994-11-20',
    age: 30,
    gender: 'male',
    interestedIn: 'women',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    ],
    bio: "Tech entrepreneur 💻 Building the future one line of code at a time. Love good music, better conversations, and the best coffee ☕",
    interests: ['Tech', 'Startups', 'Music', 'Coffee', 'Travel', 'Reading'],
    height: 182,
    education: 'MS in Computer Science',
    job: 'Software Engineer',
    location: {
      city: 'Seattle',
      country: 'USA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
    },
    isVerified: true,
    isOnline: true,
    lastActive: new Date().toISOString(),
    isPremium: true,
    instantCircleEnabled: true,
    friendzoneModeEnabled: false,
    swipeCount: 678,
    likeCount: 289,
    matchCount: 134,
    superLikesRemaining: 10,
    boostsRemaining: 5,
    isAI: true,
  },
  {
    email: 'james.ai@velvii.app',
    fullName: 'James Rodriguez',
    username: 'james_outdoors',
    dateOfBirth: '1997-07-08',
    age: 27,
    gender: 'male',
    interestedIn: 'women',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
      'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=800&q=80',
    ],
    bio: "Mountain lover 🏔️ Rock climbing, camping, and chasing sunsets. Looking for an adventure partner who's not afraid to get lost in nature 🌲",
    interests: ['Hiking', 'Camping', 'Cycling', 'Photography', 'Beach', 'Travel'],
    height: 178,
    education: 'Bachelor in Environmental Science',
    job: 'Environmental Consultant',
    location: {
      city: 'Denver',
      country: 'USA',
      coordinates: { lat: 39.7392, lng: -104.9903 },
    },
    isVerified: true,
    isOnline: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isPremium: false,
    instantCircleEnabled: false,
    friendzoneModeEnabled: false,
    swipeCount: 345,
    likeCount: 156,
    matchCount: 67,
    superLikesRemaining: 5,
    boostsRemaining: 0,
    isAI: true,
  },
  {
    email: 'michael.ai@velvii.app',
    fullName: 'Michael Kim',
    username: 'mike_creative',
    dateOfBirth: '1996-02-14',
    age: 28,
    gender: 'male',
    interestedIn: 'everyone',
    photos: [
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80',
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=800&q=80',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&q=80',
    ],
    bio: "Creative director by day, musician by night 🎸 Love live music, street food, and spontaneous dance parties. Let's vibe! ✨",
    interests: ['Music', 'Dancing', 'Art', 'Foodie', 'Fashion', 'Comedy'],
    height: 175,
    education: 'BFA in Graphic Design',
    job: 'Creative Director',
    location: {
      city: 'Austin',
      country: 'USA',
      coordinates: { lat: 30.2672, lng: -97.7431 },
    },
    isVerified: true,
    isOnline: true,
    lastActive: new Date().toISOString(),
    isPremium: false,
    instantCircleEnabled: false,
    friendzoneModeEnabled: true,
    swipeCount: 512,
    likeCount: 234,
    matchCount: 98,
    superLikesRemaining: 5,
    boostsRemaining: 0,
    isAI: true,
  },
];

// Admin User
export const ADMIN_USER: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  email: 'admin@velvii.app',
  password: 'admin123',
  fullName: 'Admin User',
  username: 'velvii_admin',
  dateOfBirth: '1990-01-01',
  age: 34,
  gender: 'male',
  interestedIn: 'everyone',
  photos: [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
  ],
  bio: 'Velvii Admin Account - System Administrator',
  interests: ['Management', 'Tech', 'Analytics'],
  height: 180,
  education: 'MBA',
  job: 'Platform Administrator',
  location: {
    city: 'San Francisco',
    country: 'USA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  isVerified: true,
  isOnline: true,
  lastActive: new Date().toISOString(),
  isPremium: true,
  instantCircleEnabled: false,
  friendzoneModeEnabled: false,
  swipeCount: 0,
  likeCount: 0,
  matchCount: 0,
  superLikesRemaining: 999,
  boostsRemaining: 999,
  isAI: false,
  isAdmin: true,
};

// Team Velvii User
export const VELVII_TEAM_USER: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  email: 'team@velvii.app',
  password: 'secureSystemPassword',
  fullName: 'Team Velvii',
  username: 'team_velvii',
  dateOfBirth: '2023-01-01',
  age: 1,
  gender: 'female', // Using female for default styling or 'other' if supported
  interestedIn: 'everyone',
  photos: [
    '/favicon-96x96.png',
  ],
  bio: 'Official Team Velvii Account',
  interests: ['Community', 'Support', 'Updates'],
  height: 0,
  education: 'Velvii University',
  job: 'Support Team',
  location: {
    city: 'Internet',
    country: 'Global',
    coordinates: { lat: 0, lng: 0 },
  },
  isVerified: true,
  isOnline: true,
  lastActive: new Date().toISOString(),
  isPremium: true,
  instantCircleEnabled: false,
  friendzoneModeEnabled: false,
  swipeCount: 0,
  likeCount: 0,
  matchCount: 0,
  superLikesRemaining: 999,
  boostsRemaining: 999,
  isAI: false,
  isAdmin: true,
};

// Initialize seed data
export const initializeSeedData = (): User[] => {
  const now = new Date().toISOString();

  const allAIUsers: User[] = [
    // Add Admin User first
    {
      ...ADMIN_USER,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    },
    ...AI_FEMALE_USERS.map(user => ({
      ...user,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    })),
    ...AI_MALE_USERS.map(user => ({
      ...user,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    })),
  ];

  return allAIUsers;
};

// AI Response Templates
export const AI_RESPONSE_TEMPLATES = {
  greeting: [
    "Hey! How's your day going? 😊",
    "Hi there! Thanks for matching with me!",
    "Hello! I love your profile! What brings you to Velvii?",
    "Hey! Your interests caught my eye 👀",
  ],
  followUp: [
    "So what do you like to do for fun?",
    "Tell me more about yourself!",
    "What's your favorite thing about this city?",
    "Any fun plans this weekend?",
  ],
  compliment: [
    "You have great taste in music!",
    "Your photos are amazing!",
    "I love your vibe!",
    "We have so much in common!",
  ],
  question: [
    "What's your go-to coffee order? ☕",
    "Beach or mountains? 🏖️⛰️",
    "What's the last great book you read?",
    "Favorite type of cuisine?",
  ],
};

// Generate AI response
export const generateAIResponse = (messageHistory: string[]): string => {
  const templates = AI_RESPONSE_TEMPLATES;

  if (messageHistory.length === 0) {
    return templates.greeting[Math.floor(Math.random() * templates.greeting.length)];
  }

  if (messageHistory.length === 1) {
    return templates.followUp[Math.floor(Math.random() * templates.followUp.length)];
  }

  const allResponses = [
    ...templates.followUp,
    ...templates.compliment,
    ...templates.question,
  ];

  return allResponses[Math.floor(Math.random() * allResponses.length)];
};