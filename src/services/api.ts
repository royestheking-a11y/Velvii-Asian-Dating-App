import axios from 'axios';
import { User, Match, Message, SwipeAction, Feedback, Broadcast } from '@/types';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to include token if we had one (simulated auth for now)
// api.interceptors.request.use((config) => { ... });

export const auth = {
    login: async (email: string, password: string): Promise<User> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    signup: async (userData: any): Promise<User> => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },
    me: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export const users = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },
    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    create: async (userData: Partial<User>): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    update: async (id: string, updates: Partial<User>): Promise<User> => {
        const response = await api.put(`/users/${id}`, updates);
        return response.data;
    },
    uploadPhoto: async (id: string, formData: FormData): Promise<{ url: string }> => {
        const response = await api.post(`/users/${id}/photos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    verify: async (data: { userId: string, selfieUrl: string }): Promise<any> => {
        const response = await api.post('/users/verify', data);
        return response.data;
    },
    getVerificationStatus: async (userId: string): Promise<any> => {
        const response = await api.get(`/users/${userId}/verification`);
        return response.data;
    }
};

export const matches = {
    getAll: async (userId: string): Promise<any[]> => {
        // Returns { match, user, lastMessage }[]
        const response = await api.get(`/matches/${userId}`);
        return response.data;
    },
    getById: async (matchId: string): Promise<any> => {
        const response = await api.get(`/matches/single/${matchId}`);
        return response.data;
    },
    update: async (matchId: string, updates: any): Promise<any> => {
        const response = await api.put(`/matches/${matchId}`, updates);
        return response.data;
    },
    delete: async (matchId: string): Promise<void> => {
        await api.delete(`/matches/${matchId}`);
    }
};

export const messages = {
    getHistory: async (matchId: string): Promise<Message[]> => {
        const response = await api.get(`/messages/${matchId}?t=${Date.now()}`);
        return response.data;
    },
    send: async (messageData: Partial<Message>): Promise<Message> => {
        const response = await api.post('/messages', messageData);
        return response.data;
    },
    markAsRead: async (matchId: string, userId: string): Promise<void> => {
        await api.post(`/messages/${matchId}/read`, { userId });
    },
    update: async (id: string, updates: Partial<Message>): Promise<Message> => {
        const response = await api.put(`/messages/${id}`, updates);
        return response.data;
    },
    delete: async (id: string): Promise<Message> => {
        const response = await api.delete(`/messages/${id}`);
        return response.data;
    }
};

export const actions = {
    swipe: async (userId: string, targetUserId: string, action: 'like' | 'dislike' | 'superlike'): Promise<SwipeAction> => {
        const response = await api.post('/actions/swipe', { userId, targetUserId, action });
        return response.data;
    },
    like: async (fromUserId: string, toUserId: string, type: 'like' | 'superlike'): Promise<{ like: any, match: Match | null }> => {
        const response = await api.post('/actions/like', { fromUserId, toUserId, type });
        return response.data;
    },
    getLikes: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/actions/likes/${userId}`);
        return response.data;
    },
    getSwipes: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/actions/swipes/${userId}`);
        return response.data;
    },
    report: async (data: { reporterId: string, reportedUserId: string, reason: string, details: string }): Promise<any> => {
        const response = await api.post('/actions/report', data);
        return response.data;
    },
    submitFeedback: async (data: { userId: string, type: string, message: string, rating?: number }): Promise<any> => {
        const response = await api.post('/actions/feedback', data);
        return response.data;
    }
};

export const admin = {
    getStats: async (): Promise<any> => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
        const response = await api.patch(`/admin/users/${id}`, updates);
        return response.data;
    },
    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },
    // Broadcasts
    sendBroadcast: async (data: { title: string, message: string, type: string, targetAudience: string }): Promise<any> => {
        const response = await api.post('/admin/broadcast', data);
        return response.data;
    },
    // Feedback
    getFeedback: async (): Promise<Feedback[]> => {
        const response = await api.get('/admin/feedback');
        return response.data;
    },
    updateFeedback: async (id: string, updates: Partial<Feedback>): Promise<Feedback> => {
        const response = await api.patch(`/admin/feedback/${id}`, updates);
        return response.data;
    },
    // Verification
    getVerificationRequests: async (): Promise<any[]> => {
        const response = await api.get('/admin/verification-requests');
        return response.data;
    },
    reviewVerification: async (id: string, status: 'approved' | 'rejected'): Promise<any> => {
        const response = await api.post(`/admin/verification-requests/${id}/review`, { status });
        return response.data;
    },
    // Packages
    getPackages: async (): Promise<any[]> => {
        const response = await api.get('/admin/packages');
        return response.data;
    },
    updatePackage: async (id: string, updates: any): Promise<any> => {
        const response = await api.patch(`/admin/packages/${id}`, updates);
        return response.data;
    },
    // Reports
    getReports: async (): Promise<any[]> => {
        const response = await api.get('/admin/reports');
        return response.data;
    },
    updateReport: async (id: string, updates: any): Promise<any> => {
        const response = await api.patch(`/admin/reports/${id}`, updates);
        return response.data;
    },
    // Media
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await api.post('/admin/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;
    }
};

export const subscriptions = {
    create: async (data: { userId: string, plan: string, price: number, duration: string }): Promise<any> => {
        const response = await api.post('/users/subscribe', data);
        return response.data;
    }
};

export default api;
