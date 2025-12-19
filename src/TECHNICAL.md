# Velvii - Technical Documentation

## Architecture Overview

Velvii is a single-page application (SPA) built with React and TypeScript, using local storage for data persistence. The architecture follows modern React patterns with hooks, context, and functional components.

## Tech Stack

### Frontend Framework
- **React 18+**: Core UI library with hooks
- **TypeScript 5+**: Static type checking
- **Motion (Framer Motion)**: Animation library

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Custom CSS Variables**: Theme customization
- **PostCSS**: CSS processing

### State Management
- **React Context API**: Global state (AuthContext)
- **React Hooks**: Local component state
- **localStorage**: Data persistence

### Build Tools
- **Figma Make**: Development environment
- **ES Modules**: Modern JavaScript modules

## Project Structure

```
velvii/
├── components/
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication flows
│   ├── chat/               # Messaging system
│   ├── landing/            # Landing page
│   ├── layout/             # Layout components
│   ├── matches/            # Matches list
│   ├── premium/            # Premium subscription
│   ├── profile/            # User profile
│   ├── swipe/              # Swipe interface
│   └── ui/                 # Reusable UI components
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── types/
│   └── index.ts            # TypeScript types
├── utils/
│   ├── helpers.tsx         # Utility functions
│   ├── storage.tsx         # LocalStorage operations
│   └── seedData.ts         # Demo data
├── styles/
│   └── globals.css         # Global styles
└── App.tsx                 # Root component
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  username: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'men' | 'women' | 'everyone';
  photos: string[];
  bio: string;
  interests: string[];
  height?: number;
  education?: string;
  job?: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number; };
  };
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  isPremium: boolean;
  premiumUntil?: string;
  instantCircleEnabled: boolean;
  friendzoneModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  swipeCount: number;
  likeCount: number;
  matchCount: number;
  superLikesRemaining: number;
  boostsRemaining: number;
  isAI?: boolean;
}
```

### Match
```typescript
interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount1: number;
  unreadCount2: number;
}
```

### Message
```typescript
interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'image' | 'voice';
  content: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
  deletedFor?: string[];
}
```

### Like
```typescript
interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'like' | 'superlike';
  createdAt: string;
}
```

### SwipeAction
```typescript
interface SwipeAction {
  id: string;
  userId: string;
  targetUserId: string;
  action: 'like' | 'nope' | 'superlike';
  createdAt: string;
}
```

## State Management

### AuthContext
Central authentication state managed via React Context:

```typescript
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}
```

**Provider Location**: Wraps entire app in `App.tsx`

**Consumer Hook**: `useAuth()` available in any component

## Local Storage Schema

### Storage Keys
```javascript
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
};
```

### Data Operations
All localStorage operations are centralized in `/utils/storage.tsx`:

- **Generic Operations**: `getFromStorage`, `setToStorage`, `removeFromStorage`
- **User Operations**: `getCurrentUser`, `setCurrentUser`, `getAllUsers`, etc.
- **Match Operations**: `getMatchesForUser`, `addMatch`, `isMatched`, etc.
- **Message Operations**: `getMessagesForMatch`, `addMessage`, `markMessagesAsRead`, etc.

## Component Architecture

### Page Components
Main route-level components:
- `LandingPage`: Marketing/hero page
- `LoginPage`: User login
- `SignupPage`: User registration
- `ProfileSetup`: Multi-step onboarding
- `SwipePage`: Card swipe interface
- `MatchesPage`: Matches list
- `ChatPage`: 1-on-1 messaging
- `ProfilePage`: User profile view
- `PremiumPage`: Subscription options
- `AdminDashboard`: Admin panel

### Layout Components
- `BottomNav`: Bottom navigation bar with 3 tabs

### Feature Components
- `SwipeCard`: Individual profile card with gesture support
- `ProfileModal`: Full profile view modal
- `MatchModal`: Match celebration modal

### UI Components
Reusable components from shadcn/ui in `/components/ui/`

## Routing Strategy

### App-Level Routing
Managed via state in `App.tsx`:

```typescript
type Page = 'landing' | 'login' | 'signup' | 'profile-setup' | 'main';
type MainTab = 'discover' | 'matches' | 'profile';
```

**Flow**:
1. Landing → Signup → Profile Setup → Main App
2. Main App uses `MainTab` state for bottom navigation

### Modal Overlays
- Premium page
- Admin dashboard
- Chat page
- Profile modal
- Match modal

All rendered as full-screen overlays with close handlers.

## Animation System

### Framer Motion Patterns

**Page Transitions**:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

**Card Swipe**:
```typescript
const x = useMotionValue(0);
const rotate = useTransform(x, [-300, 300], [-30, 30]);
```

**Match Celebration**:
```typescript
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: 'spring' }}
```

### CSS Animations
Custom animations in `globals.css`:
- `swipe-right`: Card swipe right
- `swipe-left`: Card swipe left  
- `swipe-up`: Card swipe up

## Swipe Mechanics

### Gesture Detection
Using Motion's `drag` feature:

```typescript
<motion.div
  drag
  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
  onDragEnd={(event, info) => {
    if (Math.abs(info.offset.x) > 150) {
      // Horizontal swipe
    } else if (info.offset.y < -150) {
      // Up swipe
    }
  }}
>
```

### Visual Feedback
- **Green border**: LIKE (swipe right)
- **Red border**: NOPE (swipe left)
- **Blue border**: SUPER LIKE (swipe up)

### Thresholds
- Horizontal: 150px
- Vertical (up): -150px

## Matching Algorithm

### Current Implementation
```typescript
// Simple demo: 50% match probability
const isMatch = Math.random() > 0.5;
```

### Filter Logic
```typescript
matchesFilters(user, currentUser, filters):
- Age range check
- Gender preference check
- Interest compatibility check
- Online status check (if enabled)
- Verified status check (if enabled)
- Distance check (if coordinates available)
```

### Exclusions
Users are filtered out if:
- Same as current user
- Already swiped on
- Blocked
- Already matched
- Doesn't match filter preferences

## Chat System

### Message Flow
1. User types message
2. Message added to localStorage
3. UI updates immediately
4. Match `lastMessageAt` updated
5. If AI user: Auto-reply after 2-3 seconds

### AI Auto-Reply
```typescript
generateAIResponse(messageHistory):
- First message: greeting template
- Second message: follow-up question
- Later: random from templates (compliment/question)
```

### Message Types
Currently supports:
- `text`: Regular text messages
- `image`: Planned (not implemented)
- `voice`: Planned (not implemented)

## Premium System

### Feature Gating
```typescript
const isPremiumActive = (user: User): boolean => {
  if (!user.isPremium) return false;
  if (!user.premiumUntil) return false;
  return new Date(user.premiumUntil) > new Date();
};
```

### Limits
**Free Users**:
- 100 swipes/day
- 1 Super Like/day
- 0 boosts

**Premium Users**:
- Unlimited swipes
- 10 Super Likes/day
- 5 boosts

### Subscription
Instant activation (demo mode):
```typescript
updateCurrentUser({
  isPremium: true,
  premiumUntil: endDate.toISOString(),
  superLikesRemaining: 10,
  boostsRemaining: 5,
});
```

## Safety Features

### Block System
```typescript
isBlocked(blockerId, blockedUserId):
- Bidirectional check
- Prevents matching
- Hides from swipe stack
```

### Report System
Categories:
- `fake`: Fake profile
- `harassment`: Harassment
- `spam`: Spam
- `explicit`: Explicit content

Status tracking:
- `pending`: Awaiting review
- `reviewed`: Under review
- `resolved`: Action taken

## Seed Data

### AI Users
6 pre-configured users (3 male, 3 female):
- Complete profiles with photos, bio, interests
- Various locations, jobs, education
- Mix of premium and free accounts
- Auto-reply capabilities

### Initialization
On first load, if no users exist:
```typescript
const aiUsers = initializeSeedData();
setAllUsers(aiUsers);
```

## Performance Considerations

### Optimizations
1. **Component memoization**: React.memo for expensive renders
2. **Virtual scrolling**: Could be added for long match lists
3. **Image lazy loading**: Native lazy loading on images
4. **Code splitting**: Could add with React.lazy()

### Limitations
- localStorage size limit (~5-10MB per domain)
- No pagination (all data loaded at once)
- No caching strategy (data fetched on every render)

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Required Features
- localStorage
- ES6+ JavaScript
- CSS Grid/Flexbox
- Touch events (for mobile)

## Security Considerations

### Current Implementation
⚠️ **This is a demo app - NOT production-ready**

**What's NOT implemented**:
- Password hashing
- Authentication tokens
- HTTPS enforcement
- XSS protection
- CSRF protection
- Rate limiting
- Input sanitization
- SQL injection prevention (no SQL)

### For Production
Would need:
- Secure backend (Node.js/Python/etc.)
- JWT or session-based auth
- Password hashing (bcrypt)
- HTTPS only
- Input validation/sanitization
- Rate limiting
- CORS configuration
- Environment variables for secrets

## Testing Strategy

### Potential Test Cases
```typescript
// Unit Tests
- Utility functions (helpers.tsx)
- Storage operations (storage.tsx)
- Filter logic (matchesFilters)
- Date calculations (calculateAge)

// Integration Tests
- Swipe flow
- Match creation
- Chat messaging
- Premium subscription

// E2E Tests
- User registration flow
- Complete swipe-to-chat journey
- Premium upgrade flow
```

### Testing Tools (Not Implemented)
- Jest: Unit testing
- React Testing Library: Component testing
- Cypress: E2E testing

## Error Handling

### Current Approach
```typescript
try {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
} catch (error) {
  console.error(`Error reading from localStorage`, error);
  return defaultValue;
}
```

### Improvements Needed
- User-facing error messages
- Error boundary components
- Retry logic for failed operations
- Graceful degradation

## Accessibility (A11Y)

### Current Status
Basic accessibility:
- Semantic HTML where possible
- Keyboard navigation on buttons
- Alt text on images
- Color contrast meets WCAG AA

### Areas for Improvement
- ARIA labels
- Screen reader announcements
- Keyboard navigation for swipe cards
- Focus management in modals
- Skip links
- Reduced motion preferences

## Mobile Responsiveness

### Breakpoints
Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile-First Approach
All components designed for mobile first, enhanced for desktop.

### Touch Gestures
- Swipe gestures on cards
- Pull to refresh (not implemented)
- Pinch to zoom on images (not implemented)

## Deployment

### Build Command
```bash
npm run build
```

### Environment
No environment variables required (demo app).

### Hosting Options
- Vercel
- Netlify
- GitHub Pages
- Any static host

## Known Issues & Limitations

1. **No Real Backend**: All data in localStorage
2. **No Image Upload**: Uses hardcoded Unsplash URLs
3. **Simple Match Logic**: Random 50% probability
4. **No Real-Time**: Simulated with setTimeout
5. **No Geolocation**: Uses random coordinates
6. **No Payment**: Instant premium activation
7. **Limited Scalability**: localStorage size limits
8. **No Data Sync**: Per-device data only

## Future Enhancements

### Phase 1 (Backend)
- Supabase/Firebase integration
- Real authentication
- Cloud storage for images
- Real-time database

### Phase 2 (Features)
- Push notifications
- WebSocket for live chat
- Advanced filters
- Profile verification
- Video chat
- Stories/moments

### Phase 3 (Scale)
- CDN for images
- Caching strategy
- Database optimization
- Load balancing
- Analytics integration

## Development Workflow

### Local Development
1. Make changes
2. Hot reload updates automatically
3. Test in browser
4. Commit changes

### Code Organization
- One component per file
- Shared logic in utils/
- Types in types/index.ts
- Styles in globals.css

### Naming Conventions
- Components: PascalCase
- Files: PascalCase.tsx
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case

## API Reference

### Helper Functions

#### `generateId()`
Generates unique ID for entities.

#### `calculateAge(dateOfBirth: string)`
Calculates age from date of birth string.

#### `calculateDistance(lat1, lon1, lat2, lon2)`
Haversine formula for distance between coordinates.

#### `matchesFilters(user, currentUser, filters)`
Checks if user matches current filter preferences.

#### `isPremiumActive(user)`
Checks if user has active premium subscription.

### Storage Functions

#### `getCurrentUser()`
Gets currently logged-in user from localStorage.

#### `getAllUsers()`
Gets all registered users.

#### `addMatch(match)`
Creates a new match between two users.

#### `getMessagesForMatch(matchId)`
Gets all messages for a specific match.

## Contributing Guidelines

If extending this project:

1. **Follow existing patterns**
2. **Type everything** (TypeScript)
3. **Keep components small** (<300 lines)
4. **Extract reusable logic** to utils/
5. **Use Tailwind classes** (avoid custom CSS)
6. **Add comments** for complex logic
7. **Test thoroughly** in browser

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Motion Documentation](https://motion.dev)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Last Updated**: December 2024
