import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, ShieldAlert, Ban, Trash2, Check, CheckCheck, BadgeCheck, Phone, PhoneOff, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { messages as apiMessages } from '@/services/api';
import { formatMessageTime, generateId, compressImage } from '@/utils/helpers';
import { getLastSeenText } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ProfileDetailModal } from '@/components/swipe/ProfileDetailModal';
import { BlockConfirmationModal } from './BlockConfirmationModal';
import { ReportModal } from './ReportModal';
import { deleteMatch, addBlock, deleteAllMessagesForMatch } from '@/utils/storage';
import { matches as apiMatches, actions as apiActions } from '@/services/api';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

export const ChatPage: React.FC = () => {
  const { id: matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket, callUser, acceptVoiceRequest, rejectVoiceRequest, onlineUsers } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  // Navigation & State Check
  const otherUser = location.state?.user as User;

  useEffect(() => {
    if (!otherUser || !matchId) {
      navigate('/app/matches');
    }
  }, [otherUser, matchId, navigate]);

  const onBack = () => navigate(-1);

  // UI State
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contextMenuMessageId, setContextMenuMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && matchId && otherUser) {
      loadMessages();
      markRead();
    }
  }, [matchId, currentUser, otherUser]);

  // If redirecting, return null
  if (!otherUser || !matchId) return null;

  // Scroll Logic
  const isInitialLoad = useRef(true);

  React.useLayoutEffect(() => {
    // If it's the very first load or a clear, instant scroll
    if (isInitialLoad.current || messages.length === 0) {
      scrollToBottom('auto');
      if (messages.length > 0) isInitialLoad.current = false;
    } else {
      // For new messages, smooth scroll
      scrollToBottom('smooth');
    }

    // Backup scroll to handle image loading layout shifts
    const timeout = setTimeout(() => {
      scrollToBottom(isInitialLoad.current ? 'auto' : 'smooth');
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  // Socket Listeners
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage: any) => {
        // Only append if it belongs to this match
        if (newMessage.matchId === matchId || newMessage.senderId === otherUser.id) {
          setMessages(prev => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, isRead: false }];
          });
          // Mark read if we are viewing? Debounce this?
          // For now, simple read on load. Real-time read receipts need more socket logic (e.g. emit 'read')
        }
      };

      const handleUpdateMessage = ({ messageId, updates }: any) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ));

        if (updates.type === 'call_accepted') {
          localStorage.setItem(`voice_perm_${otherUser.id}`, 'true');
          toast.success("Call enabled! You can now call.");
        }
      };

      socket.on('receive-message', handleNewMessage);
      socket.on('update-message', handleUpdateMessage);

      return () => {
        socket.off('receive-message', handleNewMessage);
        socket.off('update-message', handleUpdateMessage);
      };
    }
  }, [socket, matchId, otherUser.id]);

  const loadMessages = async () => {
    try {
      const response = await apiMessages.getHistory(matchId);
      let msgHistory: any[] = [];

      if (typeof response === 'object' && (response as any).messages) {
        msgHistory = (response as any).messages;
        console.log(`[DEBUG] Received v${(response as any).v} messages`);
      } else {
        msgHistory = Array.isArray(response) ? response : [];
        console.warn('[DEBUG] Received legacy/unversioned messages');
      }

      // Normalize IDs immediately upon load to ensure stability
      const normalized = msgHistory.map((m: any) => ({
        ...m,
        id: m.id || m._id
      }));
      setMessages(normalized);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const markRead = async () => {
    if (currentUser) {
      try {
        await apiMessages.markAsRead(matchId, currentUser.id);
      } catch (e) { /* ignore */ }
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSend = async () => {
    if (!currentUser || !inputText.trim() || isSending) return;

    setIsSending(true);

    try {
      const messageData: Partial<Message> = {
        matchId,
        senderId: currentUser.id,
        receiverId: otherUser.id,
        type: 'text',
        content: inputText.trim(),
        isRead: false,
        createdAt: new Date().toISOString(), // Optimistic
      };

      // 1. Optimistic Update
      const optimisticMsg = { ...messageData, id: generateId(), isDelivered: false } as Message;
      setMessages(prev => [...prev, optimisticMsg]);
      setInputText('');

      // 2. Send via API
      const sentMessage = await apiMessages.send(messageData);

      // 3. Update with real ID/Timestamp from server
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sentMessage : m));

      // 4. Socket emit is handled by Backend usually? 
      // Original code emitted from frontend. 
      // For migration, let's keep frontend emit to ensure immediate delivery if backend doesn't broadcast 'my' message back to 'me' adequately or for the 'other' user if direct connection.
      // Ideally, Backend API 'send' should emit to socket. 
      // Checking backend routes/messages.js... I created it in step 177. 
      // The backend route handles saving. The Socket logic in server/index.js handles 'send-message' event.
      // So I SHOULD emit to socket to trigger the backend socket handler if the backend API doesn't emit.
      // BUT, mixing API and Socket for sending is tricky.
      // IF I use API to Post, I don't need to emit 'send-message' manually IF the backend route emits it.
      // Let's check backend route: 
      /* 
           router.post('/', async (req, res) => {
             ... new Message(req.body).save() ...
             res.json(newMessage);
           });
      */
      // It DOES NOT emit socket event. 
      // So I must emit from frontend OR update backend to emit.
      // For consistency with existing socket logic (which helps AI reply), I'll emit from frontend.

      if (socket) {
        socket.emit('send-message', {
          ...sentMessage,
          to: otherUser.id,
          isAI: otherUser.isAI
        });
      }

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.content !== inputText.trim())); // Revert on fail
    } finally {
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      const compressedImage = await compressImage(file);
      // In a real app, upload to Cloudinary first via api.users.uploadPhoto (or specific message upload)
      // For now, sending base64/url directly if compressedImage is such.
      // Ideally: 
      // const { url } = await api.upload(file);

      const messageData: Partial<Message> = {
        matchId,
        senderId: currentUser.id,
        receiverId: otherUser.id,
        type: 'image',
        content: compressedImage, // This might be large base64? prefer URL.
      };

      const sentMessage = await apiMessages.send(messageData);
      setMessages(prev => [...prev, sentMessage]);

      if (socket) {
        socket.emit('send-message', {
          ...sentMessage,
          to: otherUser.id,
          isAI: otherUser.isAI
        });
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleCallUser = () => {
    callUser(otherUser.id, otherUser.fullName, otherUser.photos[0], matchId, (sentMsg) => {
      setMessages(prev => [...prev, sentMsg]);
      // Also save to DB via API if callUser doesn't? 
      // callUser context likely emits socket. 
      // We should probably save these system messages to DB too.
      // apiMessages.send(sentMsg);
    });
  };

  // Actions
  const handleBlock = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  const handleBlockConfirm = async () => {
    try {
      // 1. Storage Cleanup (Immediate UI update)
      deleteMatch(matchId);
      deleteAllMessagesForMatch(matchId);
      addBlock({
        id: generateId(),
        blockerId: currentUser!.id,
        blockedUserId: otherUser.id,
        createdAt: new Date().toISOString()
      });

      // 2. API Call (Backend Cleanup)
      await apiMatches.delete(matchId);

      // 3. UI Feedback & Navigation
      setShowBlockModal(false);

      // Custom Premium Toast
      toast.custom((t) => (
        <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-red-400">
          <Ban className="w-6 h-6 text-white" />
          <div>
            <h3 className="font-bold text-lg">User Blocked</h3>
            <p className="text-white/90 text-sm">You won't see them again.</p>
          </div>
        </div>
      ), { duration: 3000 });

      // Navigate back after a brief delay to let toast show
      setTimeout(() => {
        onBack();
      }, 500);

    } catch (error) {
      console.error("Block failed:", error);
      toast.error("Failed to block user completely");
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reason: string, details: string) => {
    try {
      await apiActions.report({
        reporterId: currentUser!.id,
        reportedUserId: otherUser.id,
        reason,
        details
      });

      setShowReportModal(false);

      toast.custom((t) => (
        <div className="bg-white/90 backdrop-blur-md border border-white/50 px-6 py-5 rounded-3xl shadow-2xl flex items-center gap-4 max-w-sm w-full mx-4 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-500/20 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-pink-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-in zoom-in duration-300">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Report Received</h3>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">We'll review this shortly. Thanks for helping keep Velvii safe.</p>
          </div>
          <button onClick={() => toast.dismiss(t)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      ), { duration: 4000, position: 'top-center' });

    } catch (error) {
      console.error("Report failed:", error);
      toast.error("Failed to submit report. Please try again.");
    }
  };

  const handleDeleteAllMessages = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteAllMessages = async () => {
    try {
      // api.messages.deleteConversation(matchId)
      // For now, local clear
      setMessages([]);
      deleteAllMessagesForMatch(matchId); // Storage helper

      setShowDeleteModal(false);

      toast.custom((t) => (
        <div className="bg-white/90 backdrop-blur-md border border-white/50 px-6 py-5 rounded-3xl shadow-2xl flex items-center gap-4 max-w-sm w-full mx-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-500/20 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-in zoom-in duration-300">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Chat Cleared</h3>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">All messages have been deleted.</p>
          </div>
          <button onClick={() => toast.dismiss(t)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      ), { duration: 3000 });
    } catch (e) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await apiMessages.delete(id);
      // Soft Update locally
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, content: 'This message was deleted', type: m.type === 'image' ? 'text' : m.type } : m));
      toast.custom((t) => (
        <div className="bg-white/90 backdrop-blur-md border border-white/50 px-6 py-5 rounded-3xl shadow-2xl flex items-center gap-4 max-w-sm w-full mx-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-red-500 shadow-sm flex-shrink-0 animate-in zoom-in duration-300">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Message Deleted</h3>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">The message has been removed.</p>
          </div>
          <button onClick={() => toast.dismiss(t)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      ), { duration: 3000 });
    } catch (e) {
      toast.error("Failed to delete message");
    }
  };

  if (!currentUser) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 flex items-center justify-between z-10 ${otherUser.email === 'team@velvii.app' ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors">
            <ArrowLeft className={`w-5 h-5 ${otherUser.email === 'team@velvii.app' ? 'text-white' : 'text-gray-700'}`} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
            <img src={otherUser.photos[0]} alt={otherUser.fullName} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className={`text-lg font-bold ${otherUser.email === 'team@velvii.app' ? 'text-white' : 'text-gray-900'}`}>{otherUser.fullName}</h3>
              <p className={`text-sm ${otherUser.email === 'team@velvii.app' ? 'text-white/80' : 'text-gray-500'}`}>
                {onlineUsers.some(u => u.userId === otherUser.id)
                  ? 'Online now'
                  : otherUser.lastActive
                    ? `Last seen ${getLastSeenText(otherUser.lastActive)}`
                    : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button onClick={handleCallUser} className={`w-10 h-10 rounded-full hover:bg-black/10 flex items-center justify-center ${otherUser.email === 'team@velvii.app' ? 'text-white' : 'text-gray-700'}`}>
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className={`w-10 h-10 rounded-full hover:bg-black/10 flex items-center justify-center ${otherUser.email === 'team@velvii.app' ? 'text-white' : 'text-gray-700'}`}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Start the conversation with {otherUser.fullName.split(' ')[0]}!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Ensure we have a valid ID - fallback to _id or index
            const messageId = msg.id || (msg as any)._id || `msg-${index}`;

            return (
              <div key={messageId} className={`w-full flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                {(msg as any).type === 'call_request' ? (
                  <div className="w-full max-w-sm mx-auto my-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-white fill-current" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">
                          {msg.senderId === currentUser.id
                            ? "Your request to enable voice calling has been sent"
                            : "Request to enable voice calling"
                          }
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed mb-3">
                          {msg.senderId === currentUser.id
                            ? "Once it's accepted, you can start chatting."
                            : "Accept to start voice chatting with this user."
                          }
                        </p>

                        {msg.senderId !== currentUser.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptVoiceRequest(otherUser.id, matchId, msg.id, (updatedMsg) => {
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...updatedMsg } : m));
                              })}
                              className="bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectVoiceRequest(otherUser.id, msg.id, (updatedMsg) => {
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...updatedMsg } : m));
                              })}
                              className="bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (msg as any).type === 'call_accepted' ? (
                  <div className="flex justify-center my-4 w-full">
                    <div className="bg-green-50 border border-green-100 text-green-700 px-5 py-3 rounded-full text-sm flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-300">
                      <div className="bg-green-500 rounded-full p-1">
                        <CheckCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-semibold">Voice Call Request Accepted</span>
                    </div>
                  </div>
                ) : (msg as any).type === 'missed_call' ? (
                  <div className="flex justify-center my-4 w-full">
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-sm">
                      <PhoneOff className="w-4 h-4" />
                      <span className="font-semibold">Missed Call</span>
                    </div>
                  </div>
                ) : (
                  <MessageBubble
                    message={{ ...msg, id: messageId }}
                    isOwn={msg.senderId === currentUser.id}
                    otherUser={otherUser}
                    onContextMenu={() => {
                      console.log('[DEBUG] Context menu triggered for message:', messageId);
                      setContextMenuMessageId(messageId);
                    }}
                  />
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-8">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-3xl border border-gray-200">
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <ImageIcon className="w-6 h-6" />
          </button>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none px-2"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${inputText.trim() ? 'bg-orange-500 shadow-md' : 'bg-gray-300'}`}>
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Context Menu for Messages */}
      <AnimatePresence>
        {contextMenuMessageId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setContextMenuMessageId(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl p-2 w-48 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                // Find message by checking both id and _id
                const msg = messages.find(m =>
                  m.id === contextMenuMessageId ||
                  (m as any)._id === contextMenuMessageId ||
                  contextMenuMessageId?.startsWith('msg-')
                );

                // For index-based IDs, extract the actual message
                let actualMsg = msg;
                if (contextMenuMessageId?.startsWith('msg-')) {
                  const idx = parseInt(contextMenuMessageId.replace('msg-', ''));
                  actualMsg = messages[idx];
                }

                const isOwnMessage = actualMsg?.senderId === currentUser?.id;

                return (
                  <>
                    <button
                      onClick={() => {
                        if (actualMsg?.content) {
                          navigator.clipboard.writeText(actualMsg.content);
                          toast.success("Copied to clipboard");
                        }
                        setContextMenuMessageId(null);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" /> Copy
                    </button>

                    {!isOwnMessage && (
                      <button
                        onClick={() => {
                          setContextMenuMessageId(null);
                          handleReport();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 rounded-lg transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" /> Report
                      </button>
                    )}

                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          // Use actual message ID from database, or fallback to the context menu ID if it looks valid
                          let realId = actualMsg?.id || (actualMsg as any)?._id;

                          if (!realId && contextMenuMessageId && !contextMenuMessageId.startsWith('msg-')) {
                            realId = contextMenuMessageId;
                          }

                          if (realId) {
                            handleDeleteMessage(realId);
                          } else {
                            // Detailed debugging toast
                            const idVal = actualMsg?.id === undefined ? 'undefined' : JSON.stringify(actualMsg?.id);
                            const _idVal = (actualMsg as any)?._id === undefined ? 'undefined' : JSON.stringify((actualMsg as any)?._id);
                            toast.error(`ID Missing. id: ${idVal}, _id: ${_idVal}`);
                          }
                          setContextMenuMessageId(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Bottom Sheet Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-8 border-t border-gray-100 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

              <div className="space-y-2">
                <button
                  onClick={handleReport}
                  className="w-full p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all rounded-2xl text-gray-900 font-bold text-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600">
                    <Flag className="w-5 h-5" />
                  </div>
                  Report Member
                </button>

                <button
                  onClick={handleBlock}
                  className="w-full p-4 flex items-center gap-4 bg-gray-50 hover:bg-red-50 active:scale-[0.98] transition-all rounded-2xl text-red-600 font-bold text-lg group"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-red-500 group-hover:text-red-600">
                    <Ban className="w-5 h-5" />
                  </div>
                  Block User
                </button>

                <button
                  onClick={handleDeleteAllMessages}
                  className="w-full p-4 flex items-center gap-4 bg-gray-50 hover:bg-red-50 active:scale-[0.98] transition-all rounded-2xl text-red-600 font-bold text-lg group"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-red-500 group-hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  Delete Chat
                </button>
              </div>

              <button
                onClick={() => setShowMenu(false)}
                className="w-full mt-4 py-4 text-center text-gray-500 font-bold text-lg hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showProfile && <ProfileDetailModal user={otherUser} onClose={() => setShowProfile(false)} />}
      <BlockConfirmationModal
        isOpen={showBlockModal}
        userName={otherUser.fullName}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
      />
      <ReportModal
        isOpen={showReportModal}
        userName={otherUser.fullName}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Conversation?</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                This will permanently delete all messages in this chat. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAllMessages}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-[0.98]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

const MessageBubble = ({ message, isOwn, otherUser, onContextMenu }: any) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onContextMenu();
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex items-end gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <img src={otherUser.photos[0]} className="w-6 h-6 rounded-full object-cover mb-1 border border-gray-100" alt="Avatar" />
        )}
        <div className={`relative px-4 py-3 min-w-[120px] rounded-2xl border ${isOwn ? 'bg-orange-50 border-orange-100 rounded-tr-sm' : 'bg-gray-50 border-gray-100 rounded-tl-sm'}`}>
          <div className="flex items-center gap-2 text-gray-400 italic text-sm">
            <Ban className="w-4 h-4" />
            <span>Message deleted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu();
      }}
      className={`flex items-end gap-2 max-w-[85%] cursor-pointer select-none ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <img
          src={otherUser.photos[0]}
          className="w-6 h-6 rounded-full object-cover mb-1 border border-gray-100"
          alt="Avatar"
        />
      )}

      <div className={`relative px-4 py-2 min-w-[80px] transition-transform active:scale-95 ${isOwn
        ? 'bg-orange-500 text-white rounded-2xl rounded-tr-sm'
        : 'bg-white border border-gray-100 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm'
        }`}>
        {message.type === 'image' ? (
          <div className="mb-1">
            <img src={message.content} alt="Content" className="rounded-lg max-w-full" />
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
        )}

        <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
          <span className="text-[10px] min-w-fit">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="ml-0.5">
              {message.isRead ? (
                <CheckCheck className="w-3 h-3 text-white" />
              ) : (
                <Check className="w-3 h-3 text-white/70" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
};