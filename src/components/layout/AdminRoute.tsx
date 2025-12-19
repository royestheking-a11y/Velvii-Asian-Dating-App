import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AdminRoute = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return currentUser?.isAdmin ? <Outlet /> : <Navigate to="/app" replace />;
};
