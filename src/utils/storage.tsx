// Local Storage Utilities for Velvii

import { User, Match, Message, Like, Report, Block, Notification, SwipeAction, Boost, Subscription, Feedback, VerificationRequest, FilterPreferences } from '@/types';

const STORAGE_KEYS = {
  CURRENT_USER: 'velvii_current_user',
  USERS: 'velvii_users',
  LIKES: 'velvii_likes',
  MATCHES: 'velvii_matches',
  MESSAGES: 'velvii_messages',
  REPORTS: 'velvii_reports',
  BLOCKS: 'velvii_blocks',
  NOTIFICATIONS: 'velvii_notifications',
  SWIPE_ACTIONS: 'velvii_swipe_actions',
  BOOSTS: 'velvii_boosts',
  SUBSCRIPTIONS: 'velvii_subscriptions',
  FILTER_PREFERENCES: 'velvii_filter_preferences',
  FEEDBACK: 'velvii_feedback',
  VERIFICATION_REQUESTS: 'velvii_verification_requests',
} as const;

// Generic storage functions
export const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      try {
        // Safe cleanup: Delete non-critical data only
        localStorage.removeItem('velvii_swipe_actions');
        localStorage.removeItem('velvii_notifications');
        localStorage.removeItem('velvii_verification_requests');

        // Try saving again
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('Critical Storage Error: Cannot save even after cleanup.', retryError);
      }
    } else {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }
};

export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

// User Functions
export const getCurrentUser = (): User | null => {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const getAllUsers = (): User[] => {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
};

export const setAllUsers = (users: User[]): void => {
  setToStorage(STORAGE_KEYS.USERS, users);
};

export const addUser = (user: User): void => {
  const users = getAllUsers();
  users.push(user);
  setAllUsers(users);
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    setAllUsers(users);

    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      setCurrentUser(users[index]);
    }
  }
};

export const getUserById = (userId: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
};

export const deleteUser = (userId: string): void => {
  const users = getAllUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  setAllUsers(filteredUsers);

  // If deleted user is current user, clear session
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    clearCurrentUser();
  }
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Like Functions
export const getAllLikes = (): Like[] => {
  return getFromStorage<Like[]>(STORAGE_KEYS.LIKES, []);
};

// Alias for compatibility
export const getLikes = getAllLikes;

export const setAllLikes = (likes: Like[]): void => {
  setToStorage(STORAGE_KEYS.LIKES, likes);
};

export const addLike = (like: Like): void => {
  const likes = getAllLikes();
  likes.push(like);
  setAllLikes(likes);
};

export const getLikesForUser = (userId: string): Like[] => {
  const likes = getAllLikes();
  return likes.filter(like => like.toUserId === userId);
};

export const hasLiked = (fromUserId: string, toUserId: string): boolean => {
  const likes = getAllLikes();
  return likes.some(like => like.fromUserId === fromUserId && like.toUserId === toUserId);
};

// Match Functions
export const getAllMatches = (): Match[] => {
  return getFromStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
};

// Export as getMatches for compatibility
export const getMatches = getAllMatches;

export const setAllMatches = (matches: Match[]): void => {
  setToStorage(STORAGE_KEYS.MATCHES, matches);
};

export const addMatch = (match: Match): void => {
  const matches = getAllMatches();
  matches.push(match);
  setAllMatches(matches);
};

export const getMatchesForUser = (userId: string): Match[] => {
  const matches = getAllMatches();
  return matches.filter(match => match.user1Id === userId || match.user2Id === userId);
};

export const getMatchById = (matchId: string): Match | undefined => {
  const matches = getAllMatches();
  return matches.find(m => m.id === matchId);
};

export const isMatched = (user1Id: string, user2Id: string): boolean => {
  const matches = getAllMatches();
  return matches.some(
    match =>
      (match.user1Id === user1Id && match.user2Id === user2Id) ||
      (match.user1Id === user2Id && match.user2Id === user1Id)
  );
};

export const updateMatch = (matchId: string, updates: Partial<Match>): void => {
  const matches = getAllMatches();
  const index = matches.findIndex(m => m.id === matchId);

  if (index !== -1) {
    matches[index] = { ...matches[index], ...updates };
    setAllMatches(matches);
  }
};

export const deleteMatch = (matchId: string): void => {
  const matches = getAllMatches();
  const filteredMatches = matches.filter(m => m.id !== matchId);
  setAllMatches(filteredMatches);
};

// Message Functions
export const getAllMessages = (): Message[] => {
  return getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
};

export const setAllMessages = (messages: Message[]): void => {
  setToStorage(STORAGE_KEYS.MESSAGES, messages);
};

export const addMessage = (message: Message): void => {
  const messages = getAllMessages();

  // Prevent duplicates (Idempotency)
  if (messages.some(m => m.id === message.id)) {
    return;
  }

  messages.push(message);
  setAllMessages(messages);

  // Update Match lastMessageAt
  const matches = getAllMatches();
  const matchIndex = matches.findIndex(m => m.id === message.matchId);

  if (matchIndex !== -1) {
    const match = matches[matchIndex];
    const isUser1Recipient = match.user1Id === message.receiverId;

    matches[matchIndex] = {
      ...match,
      lastMessageAt: message.createdAt,
      unreadCount1: isUser1Recipient ? (match.unreadCount1 || 0) + 1 : match.unreadCount1 || 0,
      unreadCount2: !isUser1Recipient ? (match.unreadCount2 || 0) + 1 : match.unreadCount2 || 0,
    };
    setAllMatches(matches);
  }
};

export const getMessagesForMatch = (matchId: string): Message[] => {
  const messages = getAllMessages();
  return messages
    .filter(msg => msg.matchId === matchId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const markMessagesAsRead = (matchId: string, userId: string): void => {
  const messages = getAllMessages();
  const updated = messages.map(msg => {
    if (msg.matchId === matchId && msg.receiverId === userId && !msg.isRead) {
      return { ...msg, isRead: true };
    }
    return msg;
  });
  setAllMessages(updated);
};

export const deleteMessage = (messageId: string): void => {
  const messages = getAllMessages();
  const updatedMessages = messages.map(msg =>
    msg.id === messageId ? { ...msg, isDeleted: true, content: '' } : msg
  );
  setAllMessages(updatedMessages);
};

export const updateMessage = (messageId: string, updates: Partial<Message>): void => {
  const messages = getAllMessages();
  const index = messages.findIndex(m => m.id === messageId);

  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    setAllMessages(messages);
  }
};

export const deleteAllMessagesForMatch = (matchId: string): void => {
  const messages = getAllMessages();
  const filteredMessages = messages.filter(msg => msg.matchId !== matchId);
  setAllMessages(filteredMessages);
};

// Get last message between two users
export const getLastMessage = (user1Id: string, user2Id: string): Message | null => {
  const messages = getAllMessages();
  const conversation = messages
    .filter(msg =>
      (msg.senderId === user1Id && msg.receiverId === user2Id) ||
      (msg.senderId === user2Id && msg.receiverId === user1Id)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return conversation.length > 0 ? conversation[0] : null;
};

// Block Functions
export const getAllBlocks = (): Block[] => {
  return getFromStorage<Block[]>(STORAGE_KEYS.BLOCKS, []);
};

export const setAllBlocks = (blocks: Block[]): void => {
  setToStorage(STORAGE_KEYS.BLOCKS, blocks);
};

export const addBlock = (block: Block): void => {
  const blocks = getAllBlocks();
  blocks.push(block);
  setAllBlocks(blocks);
};

export const isBlocked = (blockerId: string, blockedUserId: string): boolean => {
  const blocks = getAllBlocks();
  return blocks.some(
    block =>
      (block.blockerId === blockerId && block.blockedUserId === blockedUserId) ||
      (block.blockerId === blockedUserId && block.blockedUserId === blockerId)
  );
};

// Report Functions
export const getAllReports = (): Report[] => {
  return getFromStorage<Report[]>(STORAGE_KEYS.REPORTS, []);
};

export const setAllReports = (reports: Report[]): void => {
  setToStorage(STORAGE_KEYS.REPORTS, reports);
};

export const addReport = (report: Report): void => {
  const reports = getAllReports();
  reports.push(report);
  setAllReports(reports);
};

export const updateReport = (reportId: string, updates: Partial<Report>): void => {
  const reports = getAllReports();
  const updated = reports.map(r =>
    r.id === reportId ? { ...r, ...updates } : r
  );
  setAllReports(updated);
};

// Notification Functions
export const getAllNotifications = (): Notification[] => {
  return getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
};

export const setAllNotifications = (notifications: Notification[]): void => {
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
};

export const addNotification = (notification: Notification): void => {
  const notifications = getAllNotifications();
  notifications.unshift(notification); // Add to beginning
  setAllNotifications(notifications);
};

export const getNotificationsForUser = (userId: string): Notification[] => {
  const notifications = getAllNotifications();
  return notifications.filter(n => n.userId === userId);
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getAllNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );
  setAllNotifications(updated);
};

// Swipe Action Functions
export const getAllSwipeActions = (): SwipeAction[] => {
  return getFromStorage<SwipeAction[]>(STORAGE_KEYS.SWIPE_ACTIONS, []);
};

export const setAllSwipeActions = (actions: SwipeAction[]): void => {
  setToStorage(STORAGE_KEYS.SWIPE_ACTIONS, actions);
};

export const addSwipeAction = (action: SwipeAction): void => {
  const actions = getAllSwipeActions();
  actions.push(action);
  setAllSwipeActions(actions);
};

export const hasSwipedOn = (userId: string, targetUserId: string): boolean => {
  const actions = getAllSwipeActions();
  return actions.some(action => action.userId === userId && action.targetUserId === targetUserId);
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

// Logout
export const logout = (): void => {
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
};

export const clearCurrentUser = (): void => {
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
};

// Feedback Functions
export const getAllFeedback = (): Feedback[] => {
  return getFromStorage<Feedback[]>(STORAGE_KEYS.FEEDBACK, []);
};

export const setAllFeedback = (feedback: Feedback[]): void => {
  setToStorage(STORAGE_KEYS.FEEDBACK, feedback);
};

export const addFeedback = (feedback: Feedback): void => {
  const allFeedback = getAllFeedback();
  allFeedback.unshift(feedback); // Add to top
  setAllFeedback(allFeedback);
};

export const updateFeedback = (feedbackId: string, updates: Partial<Feedback>): void => {
  const allFeedback = getAllFeedback();
  const updated = allFeedback.map(f =>
    f.id === feedbackId ? { ...f, ...updates } : f
  );
  setAllFeedback(updated);
};

// Verification Request Functions
export const getAllVerificationRequests = (): VerificationRequest[] => {
  return getFromStorage<VerificationRequest[]>(STORAGE_KEYS.VERIFICATION_REQUESTS, []);
};

export const setAllVerificationRequests = (requests: VerificationRequest[]): void => {
  setToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);
};

export const addVerificationRequest = (request: VerificationRequest): void => {
  const requests = getAllVerificationRequests();
  requests.unshift(request);
  setAllVerificationRequests(requests);
};

export const getVerificationRequestByUserId = (userId: string): VerificationRequest | undefined => {
  const requests = getAllVerificationRequests();
  return requests.find(r => r.userId === userId);
};

export const updateVerificationRequest = (requestId: string, updates: Partial<VerificationRequest>): void => {
  const requests = getAllVerificationRequests();
  const updated = requests.map(r =>
    r.id === requestId ? { ...r, ...updates } : r
  );
  setAllVerificationRequests(updated);
};

// Subscription Functions
export const getAllSubscriptions = (): Subscription[] => {
  return getFromStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
};

export const setAllSubscriptions = (subscriptions: Subscription[]): void => {
  setToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
};

export const addSubscription = (subscription: Subscription): void => {
  const subscriptions = getAllSubscriptions();
  subscriptions.push(subscription);
  setAllSubscriptions(subscriptions);
};

export const getSubscriptionByUserId = (userId: string): Subscription | undefined => {
  const subscriptions = getAllSubscriptions();
  // Return active subscription if exists
  return subscriptions.find(s => s.userId === userId && s.status === 'active');
};

export const updateSubscription = (subscriptionId: string, updates: Partial<Subscription>): void => {
  const subscriptions = getAllSubscriptions();
  const index = subscriptions.findIndex(s => s.id === subscriptionId);

  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updates };
    setAllSubscriptions(subscriptions);
  }
};

// Filter Preference Functions
export const getFilterPreferences = (): FilterPreferences | null => {
  return getFromStorage<FilterPreferences | null>(STORAGE_KEYS.FILTER_PREFERENCES, null);
};

export const setFilterPreferences = (prefs: FilterPreferences): void => {
  setToStorage(STORAGE_KEYS.FILTER_PREFERENCES, prefs);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('filter-preferences-updated'));
  }
};