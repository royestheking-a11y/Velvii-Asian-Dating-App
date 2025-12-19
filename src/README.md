# 🎉 Velvii - Premium Dating App

Welcome to **Velvii**, a premium dating web application inspired by Tantan's design language, featuring warm orange gradients and modern UI patterns.

---

## 🚀 Quick Start

### For Regular Users
1. Click **"Get Started"**
2. Create your account
3. Complete profile setup
4. Start swiping!

### For Administrators
1. Scroll to bottom of landing page
2. Click **"Administrator Access"**
3. Login with:
   - **Email:** `admin@velvii.com`
   - **Password:** `velvii878`
4. Admin panel opens automatically!

---

## ✨ Core Features

### 💕 Swipe & Match
- **Swipe Right:** Like a profile
- **Swipe Left:** Skip a profile
- **Swipe Up:** Super Like (Pro feature)
- **Undo Button:** Take back your last swipe
- **Refresh Button:** Load new profiles

### 💬 Messaging
- Chat with matches in real-time
- See who liked you (Pro feature)
- Team Velvii welcome messages
- Match notifications

### 👤 Profile Management
- Edit your profile information
- Upload photos
- Set interests and preferences
- View your stats
- Manage subscription

### ⭐ Premium Features (Velvii Pro)
- Unlimited swipes
- See who likes you
- 5 Super Likes per day
- Monthly profile boost
- Instant Circle (see nearby users)
- Ad-free experience
- Rewind last swipe

### 🛡️ Safety Features
- Report inappropriate users
- Block unwanted contacts
- Verified profiles
- Privacy controls

---

## 🎨 Design System

### Color Palette
- **Primary Gradient:** `#FF6B6B` → `#FF8E53`
- **Secondary:** Orange tones
- **Accent:** Warm complementary colors

### UI Elements
- **Border Radius:** 16-20px for cards
- **Animations:** Smooth transitions and motion
- **Typography:** Clean, modern sans-serif
- **Icons:** Lucide React icon set

### Inspired by Tantan
- Card-based swipe interface
- Bottom navigation bar
- Gradient action buttons
- Profile card layouts
- Service cards design

---

## 🔐 Admin Dashboard

### Access
Use credentials: `admin@velvii.com` / `velvii878`

### Features
- **User Statistics:** Total users, active users, matches, premium
- **User Management:** Search, filter, and manage all users
- **Quick Actions:** Verify, premium upgrade, ban, delete
- **Real-time Updates:** All changes reflect immediately

### Admin Capabilities
- ✅ Verify user profiles
- ⭐ Grant premium access
- 🚫 Ban problematic users
- 🗑️ Delete user accounts
- 📊 View analytics

---

## 💾 Data Storage

- **Technology:** LocalStorage (browser-based)
- **AI Users:** 6 seeded profiles (3 male, 3 female)
- **Persistence:** All actions saved locally
- **Reset:** Clear localStorage to start fresh

---

## 🧪 Test Accounts

### Admin Account
- **Email:** admin@velvii.com
- **Password:** velvii878
- **Access:** Full admin dashboard

### AI User Accounts (No password needed)
- emma.ai@velvii.app
- sophia.ai@velvii.app
- olivia.ai@velvii.app
- alex.ai@velvii.app
- james.ai@velvii.app
- michael.ai@velvii.app

---

## 📱 Application Flow

```
Landing Page
    ↓
Sign Up / Login
    ↓
Profile Setup (new users)
    ↓
Main App
    ├── Discover (Swipe)
    ├── Messages (Chat)
    └── Profile (Settings)
```

---

## 🎯 User Journey

### New User
1. **Landing:** See features and benefits
2. **Sign Up:** Create account with email/password
3. **Profile Setup:** 
   - Choose username
   - Set date of birth
   - Select gender
   - Choose interested in
   - Add interests
   - Set location
   - Add bio (optional)
4. **Main App:** Start discovering matches!

### Returning User
1. **Landing:** Click "Get Started"
2. **Login:** Click "Already have an account?"
3. **Enter Credentials:** Email and password
4. **Main App:** Continue from where you left off

### Admin User
1. **Landing:** Click "Administrator Access"
2. **Admin Login:** Use `admin@velvii.com` / `velvii878`
3. **Admin Dashboard:** Manage users and view analytics

---

## 🎨 Component Structure

```
/components
  /admin          → Admin dashboard
  /auth           → Login, signup, profile setup
  /chat           → Chat interface
  /layout         → Bottom nav, headers
  /messages       → Messages list
  /premium        → Premium subscription
  /profile        → Profile page, services
  /settings       → Settings page
  /swipe          → Swipe/discover interface
  /landing        → Landing page
```

---

## 🔧 Tech Stack

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **State:** React Context API
- **Storage:** LocalStorage
- **Notifications:** Sonner

---

## 📊 Features Comparison

| Feature | Free | Pro |
|---------|------|-----|
| Daily Swipes | 20 | Unlimited |
| See Who Likes You | ❌ | ✅ |
| Super Likes | 1/day | 5/day |
| Boosts | ❌ | 1/month |
| Instant Circle | ❌ | ✅ |
| Rewind | ❌ | ✅ |
| Ad-Free | ❌ | ✅ |

---

## 🛠️ Troubleshooting

### Can't login as admin?
→ Make sure you're using `admin@velvii.com` (not .app)

### No profiles to swipe?
→ Click the refresh button in discover section

### Changes not saving?
→ Check browser console, localStorage might be full

### Want to reset everything?
→ Open console (F12) and run: `localStorage.clear()` then refresh

### Admin panel not opening?
→ Credentials must be exactly: `admin@velvii.com` / `velvii878`

---

## 📄 Documentation

For detailed admin access instructions, see `/ADMIN_ACCESS.md`

---

## 🎉 Status

✅ **100% Complete & Functional**

All features implemented:
- ✅ Swipe/Discover system with animations
- ✅ Real-time messaging
- ✅ Profile management
- ✅ Premium subscription system
- ✅ Admin dashboard
- ✅ Safety features (report/block)
- ✅ Multi-step profile setup
- ✅ AI seeded users
- ✅ LocalStorage persistence
- ✅ Tantan-style design system
- ✅ Responsive layout

---

**Built with ❤️ for Velvii | Premium Dating Experience**
