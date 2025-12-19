import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, X, Eye, ShieldCheck, ShieldX } from 'lucide-react';
import { getAllUsers, updateUser, getAllVerificationRequests, updateVerificationRequest, getUserById } from '@/utils/storage';
import { admin as apiAdmin } from '@/services/api';
import { User, VerificationRequest } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeAgo } from '@/utils/helpers';

interface VerifyUsersSectionProps {
  onBadgeUpdate: (count: number) => void;
}

export const VerifyUsersSection: React.FC<VerifyUsersSectionProps> = ({ onBadgeUpdate }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'verified'>('requests');
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<User[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load Requests from API (Enriched with User data)
      const allRequests = await apiAdmin.getVerificationRequests();
      setRequests(allRequests);

      // Load Verified Users from API (Admin User List)
      const allUsers = await apiAdmin.getAllUsers();
      setVerifiedUsers(allUsers.filter(u => u.isVerified));

      // Update badge with pending count
      const pendingCount = allRequests.filter((r: any) => r.status === 'pending').length;
      onBadgeUpdate(pendingCount);
    } catch (error) {
      console.error("Failed to load verification data", error);
      toast.error("Failed to load verification data");
    }
  };

  const handleApprove = async (request: VerificationRequest) => {
    try {
      await apiAdmin.reviewVerification(request.id, 'approved');
      toast.success('Verification approved!');
      loadData();
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to approve verification');
    }
  };

  const handleReject = async (request: VerificationRequest, reason?: string) => {
    try {
      await apiAdmin.reviewVerification(request.id, 'rejected'); // API might accept reason in body if updated, but currently just status
      toast.info('Verification rejected');
      loadData();
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to reject verification');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{pendingRequests.length}</div>
          </div>
          <div className="text-orange-200 font-medium">Pending Requests</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{verifiedUsers.length}</div>
          </div>
          <div className="text-blue-200 font-medium">Verified Users</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">
              {requests.length > 0 ? Math.round((requests.filter(r => r.status === 'approved').length / requests.length) * 100) : 0}%
            </div>
          </div>
          <div className="text-purple-200 font-medium">Approval Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
              {pendingRequests.length}
            </span>
          )}
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'verified' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
          Verified Users
          {activeTab === 'verified' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        {activeTab === 'requests' ? (
          <>
            <h3 className="text-xl font-bold text-white mb-6">Verification Requests</h3>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">All Caught Up!</h4>
                <p className="text-gray-400">No pending verification requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((request) => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onView={() => setSelectedRequest(request)}
                    onApprove={() => handleApprove(request)}
                    onReject={() => handleReject(request)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-6">Verified Users Directory</h3>
            <div className="space-y-3">
              {verifiedUsers.map((user) => {
                const originalRequest = requests.find(r => r.userId === user.id);
                console.log(`User: ${user.fullName} (${user.id}) - Found Request? ${!!originalRequest}`, originalRequest ? originalRequest.status : 'N/A');
                return (
                  <div key={user.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <img
                      src={user.photos[0]}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{user.fullName}</span>
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-400">@{user.username}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {originalRequest && (
                        <button
                          onClick={() => setSelectedRequest(originalRequest)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="View Verification Photos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-gray-400">Verified</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(user.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <VerificationDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={() => handleApprove(selectedRequest)}
            onReject={(reason) => handleReject(selectedRequest, reason)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const VerificationRequestCard: React.FC<{
  request: VerificationRequest;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ request, onView, onApprove, onReject }) => {
  // Backend returns user object populated inside request
  const user = (request as any).user;
  if (!user) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-all">
      <img
        src={user.photos[0]}
        alt={user.fullName}
        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
      />
      <img
        src={request.selfieUrl}
        alt="Verification selfie"
        className="w-16 h-16 rounded-xl object-cover border-2 border-orange-500/50"
      />

      <div className="flex-1">
        <h4 className="font-semibold text-white">{user.fullName}</h4>
        <p className="text-sm text-gray-400">Submitted {formatTimeAgo(request.createdAt)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onView} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors">
          <Eye className="w-5 h-5" />
        </button>
        <button onClick={onApprove} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
          <CheckCircle className="w-5 h-5" />
        </button>
        <button onClick={onReject} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const VerificationDetailModal: React.FC<{
  request: VerificationRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}> = ({ request, onClose, onApprove, onReject }) => {
  const user = (request as any).user;
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl"
      >
        <h3 className="text-xl font-bold text-white mb-6 text-center">Compare Photos</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Profile Photo</p>
            <img src={user.photos[0]} alt="Profile" className="w-full aspect-square rounded-xl object-cover border-2 border-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Verification Selfie</p>
            <img src={request.selfieUrl} alt="Selfie" className="w-full aspect-square rounded-xl object-cover border-2 border-orange-500" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h4 className="font-semibold text-white">{user.fullName}</h4>
          <p className="text-sm text-gray-400">@{user.username}</p>
        </div>

        {request.status === 'approved' ? (
          <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-bold">Verification Approved</span>
          </div>
        ) : request.status === 'rejected' ? (
          <div className="w-full py-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center gap-3">
            <ShieldX className="w-6 h-6 text-red-400" />
            <span className="text-red-400 font-bold">Verification Rejected</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onReject('Photo does not match profile')}
              className="px-4 py-3 rounded-xl font-semibold text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldX className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Approve
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
