import React, { useState, useEffect } from 'react';
import {
  Users, Heart, MessageCircle, TrendingUp, Crown, DollarSign,
  Activity, UserCheck, Calendar, AlertTriangle, Clock, Eye
} from 'lucide-react';
import {
  getAllUsers, getAllMatches, getAllMessages, getAllReports,
  getAllSwipeActions, getAllSubscriptions
} from '@/utils/storage';
import { User, Report } from '@/types';
import { formatTimeAgo, formatPrice } from '@/utils/helpers';
import { admin as apiAdmin } from '@/services/api';

export const OverviewSection: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    totalSwipes: 0,
    pendingReports: 0,
    aiUsers: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    dau: 0,
    mau: 0,
    matchRate: 0,
    verifiedUsers: 0,
  });

  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [urgentReports, setUrgentReports] = useState<Report[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiAdmin.getStats();

      setStats({
        totalUsers: data.totalUsers,
        activeUsers: data.activeNow,
        premiumUsers: data.premiumUsers,
        totalMatches: data.totalMatches,
        totalMessages: data.totalMessages,
        totalSwipes: data.totalSwipes || 0,
        pendingReports: data.pendingReports || 0,
        aiUsers: data.aiUsers,
        totalRevenue: data.monthlyRevenue || (data.premiumUsers * 29.99), // Use real calculated revenue
        newUsersToday: data.newUsersToday,
        dau: data.dau,
        mau: data.mau,
        matchRate: data.matchRate || 0,
        verifiedUsers: data.verifiedUsers,
      });

      setRecentUsers(data.recentUsers || []);
      setUrgentReports([]);

    } catch (e) {
      console.error("Failed to load admin stats", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats - Glass Morphism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12.5%"
          trend="up"
          gradient="from-blue-500 to-cyan-500"
        />
        <GlassCard
          icon={<Activity className="w-6 h-6" />}
          label="DAU (24h)"
          value={stats.dau.toLocaleString()}
          subtitle={`MAU: ${stats.mau}`}
          gradient="from-green-500 to-emerald-500"
        />
        <GlassCard
          icon={<Crown className="w-6 h-6" />}
          label="Premium Users"
          value={stats.premiumUsers.toLocaleString()}
          subtitle={`${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% conversion`}
          gradient="from-yellow-500 to-orange-500"
        />
        <GlassCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          change="+23.8%"
          trend="up"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniGlassCard icon={<Heart />} label="Matches" value={stats.totalMatches} color="red" />
        <MiniGlassCard icon={<MessageCircle />} label="Messages" value={stats.totalMessages} color="blue" />
        <MiniGlassCard icon={<TrendingUp />} label="Swipes" value={stats.totalSwipes} color="green" />
        <MiniGlassCard icon={<AlertTriangle />} label="Reports" value={stats.pendingReports} color="orange" />
        <MiniGlassCard icon={<UserCheck />} label="Verified" value={stats.verifiedUsers} color="teal" />
        <MiniGlassCard icon={<Calendar />} label="New Today" value={stats.newUsersToday} color="indigo" />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Users</h3>
              <p className="text-sm text-gray-400">Latest registrations</p>
            </div>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <img
                  src={user.photos[0]}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{user.fullName}</span>
                    {user.isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
                    {user.isVerified && (
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()} ({formatTimeAgo(user.createdAt)})
                  </span>
                </div>
                {user.isOnline && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Platform Health</h3>
              <p className="text-sm text-gray-400">Key performance metrics</p>
            </div>
          </div>
          <div className="space-y-4">
            <HealthMetric label="Match Rate" value={stats.matchRate} max={100} unit="%" color="green" />
            <HealthMetric
              label="Premium Conversion"
              value={Math.round((stats.premiumUsers / stats.totalUsers) * 100)}
              max={100}
              unit="%"
              color="yellow"
            />
            <HealthMetric
              label="Daily Active Users"
              value={Math.round((stats.dau / stats.totalUsers) * 100)}
              max={100}
              unit="%"
              color="blue"
            />
            <HealthMetric
              label="Verified Users"
              value={Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}
              max={100}
              unit="%"
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Urgent Reports */}
      {urgentReports.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Urgent: {stats.pendingReports} Pending Reports</h3>
              <p className="text-sm text-orange-200">These reports require immediate attention</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all">
              Review All Reports
            </button>
            <button className="px-6 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Glass Morphism Card Component
const GlassCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
  gradient: string;
}> = ({ icon, label, value, subtitle, change, trend, gradient }) => {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`} />

      {/* Card */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          {change && (
            <span className={`text-sm font-medium px-2 py-1 rounded-lg ${trend === 'up' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
              }`}>
              {change}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{subtitle || label}</div>
      </div>
    </div>
  );
};

// Mini Glass Card Component
const MiniGlassCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    red: 'from-red-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-yellow-500',
    teal: 'from-teal-500 to-cyan-500',
    indigo: 'from-indigo-500 to-purple-500',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white mb-3`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
};

// Health Metric Component
const HealthMetric: React.FC<{
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}> = ({ label, value, max, unit, color }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-white">
          {value}{unit}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
