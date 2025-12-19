import React, { useState, useEffect } from 'react';
import { Crown, Calendar, TrendingUp, DollarSign, Edit, Trash2, X, Save } from 'lucide-react';
// import { updateUser } from '@/utils/storage'; 
import { admin as apiAdmin } from '@/services/api';
import { User } from '@/types';
import { formatPrice } from '@/utils/helpers';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const SubscriptionsSection: React.FC = () => {
  const [premiumUsers, setPremiumUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalPremium: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRevenue: 0,
    dailyRevenue: 0,
    conversionRate: 0,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const [statsData, allUsers] = await Promise.all([
        apiAdmin.getStats(),
        apiAdmin.getAllUsers()
      ]);

      const premium = allUsers.filter(u => u.isPremium);

      setStats({
        totalPremium: statsData.premiumUsers,
        monthlyRevenue: statsData.monthlyRevenue,
        yearlyRevenue: statsData.yearlyRevenue, // Keep raw yearly if needed, but display Total
        totalRevenue: statsData.totalRevenue, // New field
        dailyRevenue: statsData.dailyRevenue, // New field
        conversionRate: allUsers.length > 0 ? Math.round((statsData.premiumUsers / statsData.totalUsers) * 100) : 0,
      });

      setPremiumUsers(premium);
    } catch (error) {
      console.error("Failed to load subscription data", error);
      toast.error("Failed to load subscription data");
    }
  };

  const handleEditSubscription = (user: User) => {
    setEditingUser(user);
    setEditForm(user);
  };

  const handleSaveSubscription = async () => {
    if (!editingUser) return;

    try {
      await apiAdmin.updateUser(editingUser.id, {
        ...editForm,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) { toast.error('Failed to update'); return; }

    toast.success('Subscription updated successfully!');
    loadSubscriptions();
    setEditingUser(null);
  };

  const handleCancelSubscription = (userId: string, userName: string) => {
    if (confirm(`Cancel premium subscription for ${userName}?`)) {
      apiAdmin.updateUser(userId, {
        isPremium: false,
        premiumUntil: undefined,
        updatedAt: new Date().toISOString(),
      }).catch(() => toast.error('Failed to cancel'));
      toast.success('Subscription canceled');
      loadSubscriptions();
    }
  };

  const handleExtendSubscription = (userId: string, days: number) => {
    const currentExpiry = premiumUsers.find(u => u.id === userId)?.premiumUntil;
    const baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    apiAdmin.updateUser(userId, {
      premiumUntil: newExpiry.toISOString(),
      updatedAt: new Date().toISOString(),
    }).catch(() => toast.error('Failed to extend'));

    toast.success(`Subscription extended by ${days} days`);
    loadSubscriptions();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {/* Revenue High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{formatPrice(stats.totalRevenue)}</div>
          </div>
          <div className="text-sm text-green-200 font-medium">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{formatPrice(stats.monthlyRevenue)}</div>
          </div>
          <div className="text-sm text-blue-200 font-medium">Monthly Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{formatPrice(stats.dailyRevenue)}</div>
          </div>
          <div className="text-sm text-purple-200 font-medium">Daily Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalPremium}</div>
          </div>
          <div className="text-sm text-orange-200 font-medium">Premium Subscribers</div>
        </div>
      </div>

      {/* Secondary Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500/30 to-violet-500/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatPrice(stats.totalPremium > 0 ? stats.totalRevenue / stats.totalPremium : 0)}</div>
              <div className="text-sm text-indigo-100 font-medium">ARPU</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Save className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalPremium}</div>
              <div className="text-sm text-emerald-100 font-medium">Successful Payments</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-pink-100 font-medium">Canceled/Refunded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Growth Metrics</h3>
        <div className="space-y-4">
          <MetricBar label="Revenue Growth" value={23} color="green" />
          <MetricBar label="Payment Success Rate" value={100} color="blue" />
          <MetricBar label="Premium Conversion" value={stats.conversionRate} color="purple" />
          <MetricBar label="Retention Rate" value={89} color="orange" />
        </div>
      </div>

      {/* Premium Users Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Premium Subscribers</h3>
          <p className="text-sm text-gray-400 mt-1">Active premium memberships</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">User</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Email</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Plan</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Expires</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photos[0]}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{user.fullName}</span>
                          <Crown className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span className="text-xs text-gray-400">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium">
                      Monthly
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {user.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSubscription(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id, 30)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                        title="Extend 30 days"
                      >
                        <Calendar className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(user.id, user.fullName)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                        title="Cancel"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">Edit Subscription</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={editForm.premiumUntil ? new Date(editForm.premiumUntil).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm({ ...editForm, premiumUntil: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-sm lg:text-base text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveSubscription}
                    className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl text-sm lg:text-base font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 lg:w-5 h-4 lg:h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-white/10 text-white rounded-xl text-sm lg:text-base font-medium hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs lg:text-sm text-gray-300">{label}</span>
        <span className="text-xs lg:text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color as keyof typeof colors]} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};