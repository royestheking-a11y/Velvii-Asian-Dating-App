// Core Types for Velvii Dating App

export interface User {
  id: string;
  email: string;
  password?: string; // Not stored in production, only for demo
  fullName: string;
  username: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'men' | 'women' | 'everyone';
  photos: string[];
  bio: string;
  interests: string[];
  height?: number; // in cm
  education?: string;
  job?: string;
  occupation?: string; // Alternative to job
  relationshipStatus?: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isAutoLocation?: boolean;
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  isPremium: boolean;
  premiumUntil?: string;
  instantCircleEnabled: boolean;
  friendzoneModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  // Stats
  swipeCount: number;
  likeCount: number;
  matchCount: number;
  superLikesRemaining: number;
  boostsRemaining: number;
  // AI User
  isAI?: boolean;
  // Admin User
  isAdmin?: boolean;
  diamonds?: number;
  // Settings
  lookingFor?: string;
  showMeCriteria?: string[];
  settings?: UserSettings;
}

export interface UserSettings {
  notifications?: {
    email?: boolean;
    push?: boolean;
    matches?: boolean;
    likes?: boolean;
    messages?: boolean;
  };
  privacy?: {
    showOnlineStatus?: boolean;
    showLastActive?: boolean;
    showDistance?: boolean;
    hideAge?: boolean;
    onlyShowToLiked?: boolean;
    privatePhotos?: boolean;
    incognitoMode?: boolean;
    showCisgenderOnly?: boolean;
  };
  data?: {
    darkMode?: boolean;
    autoDownloadMedia?: boolean;
  };
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'like' | 'superlike';
  createdAt: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount1: number; // unread for user1
  unreadCount2: number; // unread for user2
  voiceCallEnabled?: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'image' | 'voice' | 'call_request' | 'call_accepted' | 'call_declined' | 'call_log' | 'missed_call';
  content: string;
  isRead: boolean;
  isDelivered?: boolean;
  isSeen?: boolean;
  createdAt: string;
  deletedFor?: string[]; // user IDs who deleted this message
  isDeleted?: boolean; // true if message was deleted (shows placeholder)
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'fake' | 'harassment' | 'spam' | 'explicit';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'superlike' | 'boost' | 'premium' | 'safety';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'suggestion' | 'content' | 'other';
  message: string;
  rating?: number; // 1-5 stars if applicable
  screenshot?: string; // base64 or url
  status: 'new' | 'read' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  selfieUrl: string; // base64 image
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  targetAudience: 'all' | 'premium' | 'free';
  sentAt: string;
  readCount: number;
}

export interface SwipeAction {
  id: string;
  userId: string;
  targetUserId: string;
  action: 'like' | 'nope' | 'superlike';
  createdAt: string;
}

export interface Boost {
  id: string;
  userId: string;
  activatedAt: string;
  expiresAt: string;
  impressions: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
}

export interface InstantCircleUser {
  userId: string;
  distance: number; // in meters
  isActive: boolean;
  lastSeen: string;
}

export interface ChatRoom {
  matchId: string;
  user1: User;
  user2: User;
  messages: Message[];
  typing: {
    user1: boolean;
    user2: boolean;
  };
}

// Filter preferences
export interface FilterPreferences {
  ageRange: [number, number];
  maxDistance: number; // in km
  gender: 'male' | 'female' | 'everyone';
  onlineOnly: boolean;
  verifiedOnly: boolean;
  showCommonInterests: boolean;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
}

// App State
export interface AppState {
  users: User[];
  likes: Like[];
  matches: Match[];
  messages: Message[];
  reports: Report[];
  blocks: Block[];
  notifications: Notification[];
  swipeActions: SwipeAction[];
  boosts: Boost[];
  subscriptions: Subscription[];
}

// Premium Features
export const PREMIUM_FEATURES = {
  UNLIMITED_SWIPES: 'unlimited_swipes',
  SEE_WHO_LIKED: 'see_who_liked',
  SUPER_LIKES: 'super_likes',
  BOOSTS: 'boosts',
  GLOBAL_LOCATION: 'global_location',
  INSTANT_CIRCLE: 'instant_circle',
  AD_FREE: 'ad_free',
  REWIND: 'rewind',
} as const;

// Premium Plans
export interface PremiumPlan {
  id: string;
  name: string;
  duration: 'weekly' | 'monthly' | 'yearly';
  price: number;
  features: string[];
  popular?: boolean;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'weekly',
    name: 'Weekly',
    duration: 'weekly',
    price: 9.99,
    features: ['7 days access', 'All premium features'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    duration: 'monthly',
    price: 29.99,
    features: ['30 days access', 'All premium features', 'Save 25%'],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    duration: 'yearly',
    price: 99.99,
    features: ['365 days access', 'All premium features', 'Save 70%'],
  },
];

// Interest Tags
export const INTEREST_TAGS = [
  'Travel', 'Music', 'Movies', 'Fitness', 'Yoga', 'Reading', 'Cooking',
  'Photography', 'Art', 'Dancing', 'Gaming', 'Sports', 'Wine', 'Coffee',
  'Hiking', 'Beach', 'Foodie', 'Fashion', 'Pets', 'Tech', 'Startups',
  'Entrepreneurship', 'Writing', 'Theater', 'Comedy', 'Meditation', 'Camping',
  'Cycling', 'Running', 'Swimming', 'Basketball', 'Football', 'Tennis',
];