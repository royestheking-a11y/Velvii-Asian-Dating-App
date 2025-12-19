import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { RegistrationFlow } from './components/auth/RegistrationFlow';
import { ProfileSetup } from './components/auth/ProfileSetup';
import { SwipePage } from './components/swipe/SwipePage';
import { MessagesPage } from './components/messages/MessagesPage';
import { ChatPage } from './components/chat/ChatPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { PremiumPage } from './components/premium/PremiumPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SettingsPage } from './components/settings/SettingsPage';
import { WhoLikesMePage } from './components/profile/WhoLikesMePage';
import { BottomNav } from './components/layout/BottomNav';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { users as usersApi, matches as matchesApi } from './services/api';

// Wrapper for main app pages to include BottomNav
const MainLayout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [matchCount, setMatchCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (currentUser) {
      updateMatchCount();
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => updateMatchCount();
      socket.on('receive-message', handleUpdate);
      socket.on('new-match', handleUpdate);
      return () => {
        socket.off('receive-message', handleUpdate);
        socket.off('new-match', handleUpdate);
      };
    }
  }, [socket, currentUser]);

  const updateMatchCount = async () => {
    if (!currentUser) return;
    try {
      const matchesData: any[] = await matchesApi.getAll(currentUser.id);
      const validMatches = matchesData.filter(m => m.user);
      setMatchCount(validMatches.length);
    } catch (e) {
      console.error("Failed to fetch match count", e);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav matchCount={matchCount} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #fed7aa',
              color: '#c2410c',
            },
            classNames: {
              success: '!bg-orange-50 !text-orange-600 !border-orange-200',
              error: '!bg-red-50 !text-red-600 !border-red-200',
              info: '!bg-blue-50 !text-blue-600 !border-blue-200',
              warning: '!bg-yellow-50 !text-yellow-600 !border-yellow-200',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/onboarding/register" element={<RegistrationFlow />} />
          <Route path="/onboarding/profile" element={<ProfileSetup />} />

          {/* Protected Main App Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            {/* Main Layout Routes (With Bottom Nav) */}
            <Route element={<MainLayout />}>
              <Route index element={<SwipePage />} />
              <Route path="matches" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Full Screen Routes */}
            <Route path="chat/:id" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="likes" element={<WhoLikesMePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

// Wrappers to handle navigate/close props that might be used inside components
// or to adapt them to Route elements