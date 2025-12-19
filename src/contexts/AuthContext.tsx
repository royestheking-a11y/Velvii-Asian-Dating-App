import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/services/api';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Load - Check generic user ID from local storage
    const checkAuth = async () => {
      try {
        const storedUserId = localStorage.getItem('velvii_current_user_id');
        if (storedUserId) {
          // If it's the admin session, we can't really "fetch" it from DB easily if we didn't save it to DB
          // But our seed script creates a real Admin user now! So we CAN fetch it.

          if (storedUserId === 'admin-session') {
            // Admin special case if needed, or just remove if we want to force real login
            // For now, let's treat admin-session as a signal to logout if not supported
            localStorage.removeItem('velvii_current_user_id');
            setCurrentUser(null);
          } else {
            const user = await api.get(`/users/${storedUserId}`)
              .then(res => res.data)
              .catch(() => null);

            if (user) {
              setCurrentUser(user);
            } else {
              localStorage.removeItem('velvii_current_user_id');
            }
          }
        }
      } catch (error) {
        console.error("Auth Check Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    if (user.id) {
      localStorage.setItem('velvii_current_user_id', user.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('velvii_current_user_id');
    // Clear other local keys if any
    localStorage.removeItem('velvii_saved_accounts');
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (currentUser && currentUser.id) {
      try {
        // Optimistic update
        setCurrentUser({ ...currentUser, ...updates });

        // API update
        await api.put(`/users/${currentUser.id}`, updates);
      } catch (error) {
        console.error("Error updating user profile:", error);
        toast.error("Failed to update profile");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
