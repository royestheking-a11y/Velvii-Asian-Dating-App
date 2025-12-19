import React, { useState, useEffect } from 'react';
import { Search, Heart, Trash2, Phone, PhoneIncoming, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Match } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { getMatchesForUser, getUserById, getMessagesForMatch } from '@/utils/storage';
import { formatTimeAgo } from '@/utils/helpers';

interface MatchesPageProps {
  onChatClick: (matchId: string, user: User) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({ onChatClick }) => {
  const { currentUser } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [newMatches, setNewMatches] = useState<Array<{ match: Match; user: User }>>([]);
  const [conversations, setConversations] = useState<Array<{ match: Match; user: User; lastMessage: any }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadMatches();
    }
  }, [currentUser]);

  // LISTEN FOR LIVE UPDATES
  useEffect(() => {
    if (socket) {
      const handleNewMessage = () => loadMatches();
      const handleUpdateMessage = () => loadMatches();

      socket.on('receive-message', handleNewMessage);
      socket.on('update-message', handleUpdateMessage);

      return () => {
        socket.off('receive-message', handleNewMessage);
        socket.off('update-message', handleUpdateMessage);
      };
    }
  }, [socket, currentUser]);

  const loadMatches = () => {
    if (!currentUser) return;

    const userMatches = getMatchesForUser(currentUser.id);

    const processedMatches = userMatches
      .map((match) => {
        const otherUserId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id;
        const user = getUserById(otherUserId);
        const messages = getMessagesForMatch(match.id);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        return user ? { match, user, lastMessage } : null;
      })
      .filter((m): m is { match: Match; user: User; lastMessage: any } => m !== null);

    // Split into New Matches (no messages) and Conversations (has messages)
    const newMatchesList = processedMatches
      .filter(m => !m.lastMessage)
      .sort((a, b) => new Date(b.match.createdAt).getTime() - new Date(a.match.createdAt).getTime());

    const conversationsList = processedMatches
      .filter(m => m.lastMessage)
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

    setNewMatches(newMatchesList);
    setConversations(conversationsList);
  };

  const filteredNewMatches = newMatches.filter((m) =>
    m.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((m) =>
    m.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Matches <span className="text-gray-400 text-lg font-medium">({newMatches.length + conversations.length})</span></h1>
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matches..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* New Matches Section - Horizontal Scroll */}
        {filteredNewMatches.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-orange-500 mb-3 uppercase tracking-wider">New Matches</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {filteredNewMatches.map(({ match, user }) => (
                <motion.button
                  key={match.id}
                  onClick={() => onChatClick(match.id, user)}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-pink-500">
                    <img
                      src={user.photos[0]}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                    {onlineUsers.some(u => u.userId === user.id) && (
                      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">
                    {user.fullName.split(' ')[0]}
                    {!user.settings?.privacy?.hideAge && `, ${user.age}`}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Section - Vertical List */}
        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Messages</h2>

          {filteredConversations.length === 0 && filteredNewMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {searchQuery ? 'No matches found' : 'No matches yet'}
              </h3>
              <p className="text-gray-500 max-w-xs">
                Keep swiping to find your perfect match!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map(({ match, user }) => (
                <MatchItem
                  key={match.id}
                  match={match}
                  user={user}
                  currentUserId={currentUser.id}
                  isOnline={onlineUsers.some(u => u.userId === user.id)}
                  onClick={() => onChatClick(match.id, user)}
                />
              ))}
              {filteredConversations.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No active conversations yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MatchItemProps {
  match: Match;
  user: User;
  currentUserId: string;
  isOnline: boolean;
  onClick: () => void;
}

const MatchItem: React.FC<MatchItemProps> = ({ match, user, currentUserId, isOnline, onClick }) => {
  const messages = getMessagesForMatch(match.id);
  const lastMessage = messages[messages.length - 1];
  const unreadCount = match.user1Id === currentUserId ? match.unreadCount1 : match.unreadCount2;

  return (
    <motion.button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={user.photos[0]}
          alt={user.fullName}
          className="w-16 h-16 rounded-full object-cover"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="truncate">
            {user.fullName}
            {!user.settings?.privacy?.hideAge && `, ${user.age}`}
          </h3>
          {user.isVerified && (
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {lastMessage ? (
          <p className="text-sm text-gray-500 truncate flex items-center gap-1">
            {lastMessage.senderId === currentUserId && <span className="mr-1">You:</span>}
            {lastMessage.type === 'text' ? (
              <span className="truncate">{lastMessage.content}</span>
            ) : lastMessage.type === 'image' ? (
              <span className="flex items-center gap-1 text-purple-600 font-medium">
                <ImageIcon size={14} /> Photo
              </span>
            ) : lastMessage.type === 'call_request' ? (
              <span className="flex items-center gap-1 text-orange-600 font-bold">
                <PhoneIncoming size={14} className="animate-pulse" /> Call Request
              </span>
            ) : lastMessage.type === 'call_accepted' ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 size={14} /> Call Accepted
              </span>
            ) : lastMessage.type === 'call_declined' ? (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <XCircle size={14} /> Declined
              </span>
            ) : lastMessage.type === 'call_log' ? (
              <span className="flex items-center gap-1 text-gray-500">
                <Phone size={14} /> {lastMessage.content}
              </span>
            ) : (
              'Unsupported message'
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Matched {formatTimeAgo(match.createdAt)}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {lastMessage && (
          <span className="text-xs text-gray-400">{formatTimeAgo(lastMessage.createdAt)}</span>
        )}
        {unreadCount > 0 && (
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    </motion.button>
  );
};
