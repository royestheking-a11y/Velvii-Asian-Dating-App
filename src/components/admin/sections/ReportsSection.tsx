import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Ban, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeAgo } from '@/utils/helpers';
import { toast } from 'sonner';
import api, { admin } from '@/services/api';

interface ReportsSectionProps {
  onBadgeUpdate: (count: number) => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ onBadgeUpdate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const pendingCount = reports.filter(r => r.status === 'pending').length;
    onBadgeUpdate(pendingCount);
  }, [reports, onBadgeUpdate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await admin.getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string) => {
    try {
      await admin.updateReport(reportId, { status: 'resolved' });
      toast.success('Report marked as resolved');
      loadReports();
    } catch (error) {
      toast.error("Failed to update report");
    }
  };

  const handleBanUser = async (userId: string, reportId: string) => {
    if (confirm('Are you sure you want to ban this user?')) {
      try {
        // 1. Ban User
        await api.patch(`/admin/users/${userId}`, { isOnline: false, isVerified: false }); // Or specific ban field if exists
        // 2. Resolve Report
        await admin.updateReport(reportId, { status: 'resolved' });

        toast.success('User banned and report resolved');
        loadReports();
      } catch (error) {
        toast.error("Failed to ban user");
      }
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  if (loading && reports.length === 0) {
    return <div className="p-8 text-center text-gray-400">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{pendingCount}</div>
          </div>
          <div className="text-orange-200 font-medium">Pending Reports</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{resolvedCount}</div>
          </div>
          <div className="text-green-200 font-medium">Resolved</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Ban className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{reports.length}</div>
          </div>
          <div className="text-blue-200 font-medium">Total Reports</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex gap-3">
          {[
            { value: 'all', label: 'All Reports' },
            { value: 'pending', label: 'Pending' },
            { value: 'resolved', label: 'Resolved' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value as any)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${filterStatus === filter.value
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
            <p className="text-gray-400">
              {filterStatus === 'pending'
                ? 'All reports have been reviewed'
                : 'No reports match the current filter'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            // Note: Reporter and Reported objects come populated from API now
            const reporter = report.reporter;
            const reported = report.reported;

            return (
              <div
                key={report._id || report.id}
                className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${report.status === 'pending'
                    ? 'border-orange-500/30 bg-orange-500/5'
                    : 'border-white/10'
                  }`}
              >
                <div className="flex items-start gap-6">
                  {/* Reporter Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={reporter?.photos?.[0] || 'https://via.placeholder.com/150'}
                      alt={reporter?.fullName}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Reporter</div>
                      <div className="font-medium text-white">{reporter?.fullName || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">@{reporter?.username || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-gray-400 mt-6">
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  {/* Reported User Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={reported?.photos?.[0] || 'https://via.placeholder.com/150'}
                      alt={reported?.fullName}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-orange-500/50"
                    />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Reported User</div>
                      <div className="font-medium text-white">{reported?.fullName || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">@{reported?.username || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
                        {report.reason}
                      </span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(report.createdAt)}</span>
                      {report.status === 'resolved' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                          Resolved
                        </span>
                      )}
                    </div>
                    {report.details && ( // API uses 'details', was 'description' in mock? Check schema. Model says 'details'.
                      <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">
                        "{report.details}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleResolve(report._id || report.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleBanUser(report.reportedUserId, report._id || report.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Ban User
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Report ID</div>
                  <div className="text-white font-mono">{selectedReport._id || selectedReport.id}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Reason</div>
                  <div className="text-white capitalize">{selectedReport.reason}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Details</div>
                  <div className="text-white">{selectedReport.details || 'No details provided'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className="text-white capitalize">{selectedReport.status}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Created</div>
                    <div className="text-white">{formatTimeAgo(selectedReport.createdAt)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
