import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Bot, FileText, Shield, Ban,
  DollarSign, TrendingUp, Settings, X, LogOut, ChevronLeft,
  Sparkles, Zap, Menu, MessageSquare, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllUsers } from '@/utils/storage';
import { BroadcastSection } from './sections/BroadcastSection';
import { OverviewSection } from './sections/OverviewSection';
import { ManageUsersSection } from './sections/ManageUsersSection';
import { AIProfilesSection } from './sections/AIProfilesSection';
import { ReportsSection } from './sections/ReportsSection';
import { VerifyUsersSection } from './sections/VerifyUsersSection';
import { SubscriptionsSection } from './sections/SubscriptionsSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { SettingsSection } from './sections/SettingsSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { getAllFeedback } from '@/utils/storage';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type SectionType =
  | 'overview'
  | 'users'
  | 'ai-profiles'
  | 'reports'
  | 'verify'
  | 'feedback'
  | 'subscriptions'
  | 'revenue'
  | 'analytics'
  | 'broadcast'
  | 'settings';

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'users', label: 'Manage Users', icon: Users, badge: null },
  { id: 'ai-profiles', label: 'AI Profiles', icon: Bot, badge: 6 },
  { id: 'reports', label: 'Reports', icon: FileText, badge: null },
  { id: 'verify', label: 'Verify Users', icon: Shield, badge: null },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, badge: null },
  { id: 'subscriptions', label: 'Subscriptions & Revenue', icon: DollarSign, badge: null },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: null },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone, badge: null },
  { id: 'settings', label: 'Pro Settings', icon: Settings, badge: null },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate('/login');
  };
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportBadgeCount, setReportBadgeCount] = useState(0);
  const [verifyBadgeCount, setVerifyBadgeCount] = useState(0);
  const [feedbackBadgeCount, setFeedbackBadgeCount] = useState(0);

  useEffect(() => {
    loadBadgeCounts();
  }, []);

  const loadBadgeCounts = () => {
    const allUsers = getAllUsers();
    const unverifiedCount = allUsers.filter(u => !u.isVerified && !u.isAI).length;
    setVerifyBadgeCount(unverifiedCount);

    // Feedback badge
    const allFeedback = getAllFeedback();
    const newFeedbackCount = allFeedback.filter(f => f.status === 'new').length;
    setFeedbackBadgeCount(newFeedbackCount);
  };

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
    setMobileMenuOpen(false); // Close mobile menu on selection
  };

  // Need to update menuItems in render to use dynamic badges
  // (Actually the map loop below uses item.id to check active, but uses item.badge for static.
  // We need to inject dynamic badges in the map loop or update the state usage)

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'users':
        return <ManageUsersSection />;
      case 'ai-profiles':
        return <AIProfilesSection />;
      case 'reports':
        return <ReportsSection onBadgeUpdate={setReportBadgeCount} />;
      case 'verify':
        return <VerifyUsersSection onBadgeUpdate={setVerifyBadgeCount} />;
      case 'feedback':
        return <FeedbackSection />;
      case 'subscriptions':
        return <SubscriptionsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'broadcast':
        return <BroadcastSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? 80 : 280,
        }}
        className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-50 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full transition-transform lg:transition-none`}
      >
        {/* Logo & Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-semibold">Velvii Admin</h1>
                  <p className="text-xs text-gray-400">Dashboard</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            let badge = item.badge;

            if (item.id === 'reports') badge = reportBadgeCount;
            if (item.id === 'verify') badge = verifyBadgeCount;
            if (item.id === 'feedback') badge = feedbackBadgeCount;

            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id as SectionType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {badge !== null && badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                  {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Welcome back, Administrator</p>
              </div>
            </div>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};