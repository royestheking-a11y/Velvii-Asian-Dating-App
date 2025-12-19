import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, MessageCircle, Activity, Eye } from 'lucide-react';
import { admin as apiAdmin } from '@/services/api';

export const AnalyticsSection: React.FC = () => {
  const [stats, setStats] = useState({
    dau: 0,
    mau: 0,
    totalSwipes: 0,
    totalMatches: 0,
    totalMessages: 0,
    matchRate: 0,
    engagementRate: 0,
    avgSessionTime: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await apiAdmin.getStats();

      setStats({
        dau: data.dau,
        mau: data.mau,
        totalSwipes: data.totalSwipes,
        totalMatches: data.totalMatches,
        totalMessages: data.totalMessages,
        matchRate: data.matchRate,
        engagementRate: data.engagementRate,
        avgSessionTime: data.avgSessionTime,
      });
    } catch (error) {
      console.error("Failed to load analytics", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.dau}</div>
          </div>
          <div className="text-blue-200 font-medium">Daily Active Users</div>
          <div className="text-xs text-blue-300 mt-1">Last 24 hours</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.mau}</div>
          </div>
          <div className="text-purple-200 font-medium">Monthly Active Users</div>
          <div className="text-xs text-purple-300 mt-1">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.engagementRate}%</div>
          </div>
          <div className="text-green-200 font-medium">Engagement Rate</div>
          <div className="text-xs text-green-300 mt-1">DAU / Total Users</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.matchRate}%</div>
          </div>
          <div className="text-orange-200 font-medium">Match Rate</div>
          <div className="text-xs text-orange-300 mt-1">Matches / Swipes</div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Total Swipes</h3>
              <p className="text-sm text-gray-400">All time</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{stats.totalSwipes.toLocaleString()}</div>
          <div className="text-sm text-green-400">+15.3% from last week</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Total Matches</h3>
              <p className="text-sm text-gray-400">All time</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{stats.totalMatches.toLocaleString()}</div>
          <div className="text-sm text-green-400">+22.7% from last week</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Total Messages</h3>
              <p className="text-sm text-gray-400">All time</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{stats.totalMessages.toLocaleString()}</div>
          <div className="text-sm text-green-400">+18.9% from last week</div>
        </div>
      </div>

      {/* User Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">User Engagement</h3>
          <div className="space-y-4">
            <EngagementBar label="Daily Active Users" value={stats.dau} max={100} color="blue" />
            <EngagementBar label="Monthly Active Users" value={stats.mau} max={100} color="purple" />
            <EngagementBar label="Active Conversations" value={stats.totalMatches} max={200} color="green" />
            <EngagementBar label="Messages Sent Today" value={45} max={100} color="orange" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Platform Performance</h3>
          <div className="space-y-4">
            <PerformanceMetric label="Match Rate" value={`${stats.matchRate}%`} status="excellent" />
            <PerformanceMetric label="Engagement Rate" value={`${stats.engagementRate}%`} status="good" />
            <PerformanceMetric label="Avg Session Time" value={`${stats.avgSessionTime} min`} status="good" />
            <PerformanceMetric label="Response Rate" value="78%" status="excellent" />
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">User Activity Timeline</h3>
        <div className="h-80 flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Activity chart visualization</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon with charting library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EngagementBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
  label,
  value,
  max,
  color,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color as keyof typeof colors]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PerformanceMetric: React.FC<{
  label: string;
  value: string;
  status: 'excellent' | 'good' | 'average';
}> = ({ label, value, status }) => {
  const statusColors = {
    excellent: 'bg-green-500/20 text-green-400',
    good: 'bg-blue-500/20 text-blue-400',
    average: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <span className="text-gray-300">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-bold">{value}</span>
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};
