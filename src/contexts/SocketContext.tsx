import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from './AuthContext';
import { CallModal } from '@/components/calling/CallModal';
import { toast } from 'sonner';
import { Maximize2, Mic, MicOff, PhoneOff } from 'lucide-react';
import { messages as apiMessages, matches as apiMatches } from '@/services/api';
import { addMessage, updateMessage, getMatchById, updateMatch } from '@/utils/storage';
import { generateId } from '@/utils/helpers';
import { Message } from '@/types';

interface SocketContextType {
    callUser: (userId: string, userName: string, userImage: string, matchId?: string, onMessageSent?: (msg: Message) => void) => void;
    acceptVoiceRequest: (targetUserId: string, matchId: string, requestId: string, onMessageUpdate?: (msg: Message) => void) => void;
    rejectVoiceRequest: (targetUserId: string, requestId: string, onMessageUpdate?: (msg: Message) => void) => void;
    socket: Socket | null;
    onlineUsers: { userId: string; socketId: string }[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Point to our local server
// Point to our local server or production env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Add MiniPlayer Component
const MiniCallPlayer = ({
    callerName,
    callerImage,
    status,
    duration,
    onMaximize,
    onEnd,
    isMuted,
    onToggleMute
}: any) => {
    // Format duration
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-24 right-4 z-[9999] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 flex items-center gap-4 w-80 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="relative">
                <img src={callerImage} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate">{callerName}</h4>
                <p className="text-green-400 text-xs font-mono">{status === 'connected' ? formatTime(duration) : status}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onToggleMute} className={`p-2 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button onClick={onEnd} className="p-2 rounded-full bg-red-500 text-white">
                    <PhoneOff size={16} />
                </button>
                <button onClick={onMaximize} className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600">
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<{ userId: string; socketId: string }[]>([]);

    // Call State
    const [callStatus, setCallStatus] = useState<'idle' | 'requesting' | 'incoming_request' | 'incoming' | 'outgoing' | 'connected'>('idle');
    const [isMinimized, setIsMinimized] = useState(false);

    // Timer
    const [callDuration, setCallDuration] = useState(0);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'connected') {
            interval = setInterval(() => setCallDuration(p => p + 1), 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [callerName, setCallerName] = useState('');
    const [callerImage, setCallerImage] = useState('');
    const [callerSignal, setCallerSignal] = useState<any>(null);
    const [otherUserId, setOtherUserId] = useState('');
    const [currentMatchId, setCurrentMatchId] = useState<string>('');

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);

    // Refs
    const connectionRef = useRef<Peer.Instance | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const otherUserIdRef = useRef<string>('');
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const startActualCallRef = useRef<(id: string) => void>(() => { });

    // Update ref when state changes
    useEffect(() => {
        otherUserIdRef.current = otherUserId;
    }, [otherUserId]);

    // --- SOUND MANAGEMENT ---
    const playRingtone = (type: 'incoming' | 'outgoing') => {
        // Stop any existing sound
        stopRingtone();

        const audio = new Audio();
        if (type === 'incoming') {
            // Standard Iphone-like or professional ringtone
            audio.src = 'https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3'; // Digital Phone Ring
            audio.loop = true;
        } else {
            // Outgoing Ringback tone (US Style)
            audio.src = 'https://assets.mixkit.co/active_storage/sfx/1361/1361-preview.mp3'; // Classic Phone Ring
            audio.loop = true;
        }

        audio.play().catch(e => console.log("Audio play failed (interaction needed):", e));
        ringtoneRef.current = audio;
    };

    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current = null;
        }
    };

    const playSound = (type: 'end' | 'connect') => {
        const audio = new Audio();
        if (type === 'end') audio.src = 'https://assets.mixkit.co/active_storage/sfx/1364/1364-preview.mp3'; // Hang up click
        if (type === 'connect') audio.src = 'https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3'; // Pick up click
        audio.play().catch(() => { });
    };

    // Initialize Socket
    useEffect(() => {
        if (currentUser) {
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);

            newSocket.emit('add-user', currentUser.id);

            // --- PERMISSION EVENTS ---
            newSocket.on('voice-permission-requested', ({ from, name, image }) => {
                console.log("Voice permission requested from:", name);

                // CRITICAL FIX: Set state so CallModal "Permission Request" UI appears!
                setCallStatus('incoming_request');
                setCallerName(name);
                setCallerImage(image || 'https://via.placeholder.com/150'); // Fallback image
                setOtherUserId(from);

                // Play notification sound
                try {
                    const audio = new Audio('/notification_sound.mp3');
                    audio.play().catch(e => console.log("Audio play failed", e));
                } catch (err) {
                    console.log("Audio error", err);
                }
            });

            newSocket.on('voice-permission-granted', ({ from }) => {
                console.log(`[CallDebug] Permission GRANTED by: ${from}`);
                toast.success(`Permission Granted! Connecting...`, { icon: '📞' });

                // Ensure ID is stored as string
                localStorage.setItem(`voice_perm_${String(from)}`, 'true');

                // AUTO-START CALL
                startActualCallRef.current(from);
            });

            newSocket.on('voice-permission-denied', () => {
                toast.error("Voice call request declined.");
                if (otherUserIdRef.current) {
                    localStorage.removeItem(`voice_perm_${otherUserIdRef.current}`);
                }
                setCallStatus('idle');
            });

            // --- CALL EVENTS ---
            newSocket.on('call-made', ({ signal, from, name }) => {
                setCallStatus('incoming');
                setCallerName(name || 'Unknown');
                setCallerImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');
                setCallerSignal(signal);
                setOtherUserId(from);
                setIsMinimized(false);

                // Play Incoming Ringtone
                playRingtone('incoming');
            });

            newSocket.on('call-answered', ({ signal }) => {
                setCallAccepted(true);
                setCallStatus('connected');
                stopRingtone(); // Stop ringing
                playSound('connect');
                connectionRef.current?.signal(signal);
            });

            newSocket.on('ice-candidate', ({ candidate }) => {
                connectionRef.current?.addIceCandidate(candidate);
            });

            // Clean up when call is rejected remotely
            newSocket.on('call-rejected', () => {
                toast.error("Call Declined");
                leaveCall();
            });

            // --- GLOBAL NOTIFICATION LISTENER ---
            newSocket.on('receive-notification', (notification: any) => {
                // Play specific sounds based on type
                if (notification.type === 'match') {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Success Chime
                    audio.play().catch(() => { });
                    toast.success(notification.title, {
                        description: notification.message,
                        duration: 5000,
                        icon: '💖'
                    });
                } else if (notification.type === 'message') {
                    // Message sound is handled in receive-message usually, but if this is a generic alert:
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'); // Blip
                    audio.play().catch(() => { });
                    toast.message(notification.title, { description: notification.message });
                }

                // BROWSER SYSTEM NOTIFICATION (Background Support)
                if (Notification.permission === 'granted' && document.hidden) {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/pwa-192x192.png' // Assumes PWA icon exists or uses default
                    });
                }
            });

            // --- GLOBAL MESSAGE LISTENER ---
            // This ensures we catch messages (like Missed Calls) even if not on the ChatPage
            newSocket.on('receive-message', (data: Message) => {
                // Save to storage
                addMessage(data);

                // Play Message Sound (Tantan-like quick pop)
                // Only play if not me (obviously)
                if (data.senderId !== currentUser.id) {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'); // Pop sound
                    audio.play().catch(e => console.log('Audio autoplay blocked', e));

                    // Show Toast if NOT on the chat page for this user
                    // Simple check: if URL doesn't contain matchId (approximate)
                    if (!window.location.href.includes(data.matchId)) {
                        toast.info("New Message", {
                            description: data.content.substring(0, 30) + (data.content.length > 30 ? '...' : ''),
                            icon: '💬'
                        });

                        // BROWSER NOTIFICATION
                        if (Notification.permission === 'granted' && document.hidden) {
                            new Notification("New Message", {
                                body: data.content,
                                icon: '/pwa-192x192.png'
                            });
                        }
                    }
                }
            });

            // --- GLOBAL MESSAGE UPDATE LISTENER ---
            // Handles Read Receipts and other updates
            newSocket.on('update-message', ({ messageId, updates }: any) => {
                console.log(`[Socket] Persisting update for ${messageId}`, updates);
                updateMessage(messageId, updates);
            });

            // Request Permission on Connect
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }

            // Sync Online Users
            newSocket.on('get-users', (users: any) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.disconnect();
                stopRingtone();
            };
        }
    }, [currentUser]);

    // Audio Stream Setup
    const getMedia = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setStream(currentStream);
            return currentStream;
        } catch (err) {
            console.error('Failed to get media:', err);
            toast.error('Could not access microphone.');
            return null;
        }
    };

    // 0. START FLOW
    const callUser = async (userId: string, userName: string, userImage: string, matchId?: string, onMessageSent?: (msg: Message) => void) => {
        setCallerName(userName);
        setCallerImage(userImage);
        setOtherUserId(userId);
        if (matchId) setCurrentMatchId(matchId);
        setIsMinimized(false);

        // Check Local Permission (Persistence)
        const permKey = `voice_perm_${userId}`;
        const hasLocalPermission = localStorage.getItem(permKey) === 'true';

        // Check Match Permission (Bidirectional)
        let hasMatchPermission = false;
        if (matchId) {
            const match = getMatchById(matchId);
            if (match?.voiceCallEnabled) {
                hasMatchPermission = true;
            }
        }

        const hasPermission = hasLocalPermission || hasMatchPermission;

        console.log(`[CallDebug] Checking permission for ${userId} (Key: ${permKey}) -> Local: ${hasLocalPermission}, Match: ${hasMatchPermission}`);

        if (hasPermission) {
            startActualCall(userId);
        } else {
            // Dynamic Check: Maybe backend knows it's allowed (User B accepted) but local is stale
            let serverPerm = false;
            if (matchId) {
                try {
                    console.log("[CallDebug] Checking server for match permission...");
                    const matchData = await apiMatches.getById(matchId);
                    if (matchData && matchData.voiceCallEnabled) {
                        serverPerm = true;
                        console.log("[CallDebug] Server says YES!");
                        // Update local cache
                        updateMatch(matchId, { voiceCallEnabled: true });
                        startActualCall(userId);
                        return;
                    }
                } catch (e) {
                    console.log("[CallDebug] Server check failed", e);
                }
            }

            console.log("[CallDebug] Permission missing. Sending request.");
            setCallStatus('requesting'); // Show "Requesting permission..." UI
            // NEW FLOW: Send Request Message
            const msg: Partial<Message> = {
                id: generateId(),
                matchId: matchId || 'unknown',
                senderId: currentUser?.id || '',
                receiverId: userId,
                type: 'call_request',
                content: "📞 Voice Call Request",
                isRead: false,
                isDelivered: true,
                createdAt: new Date().toISOString()
            };

            // PERSISTENCE FIX: Save to DB via API
            try {
                // We cast to Message because we need the full object for local addMessage
                addMessage(msg as Message);
                if (onMessageSent) onMessageSent(msg as Message);

                // API Call
                apiMessages.send(msg); // Fire and forget or await if needed, but for UX we proceed.
            } catch (e) {
                console.error("Failed to save call request", e);
            }

            socket?.emit('request-voice-permission', {
                to: userId,
                from: currentUser?.id,
                name: currentUser?.fullName
            });

            // Log request logic
            socket?.emit("send-message", {
                ...msg,
                text: msg.content
            });
        }
    };

    // 1. Start Actual Call (Outgoing)
    const startActualCall = async (userId: string) => {
        setCallStatus('outgoing');
        playRingtone('outgoing'); // Play Ringback

        const currentStream = await getMedia();
        if (!currentStream || !socket) return;

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data) => {
            socket.emit('call-user', {
                userToCall: userId,
                signalData: data,
                from: currentUser?.id,
                name: currentUser?.fullName
            });
        });

        peer.on('stream', (userStream) => {
            playRemoteAudio(userStream);
        });

        connectionRef.current = peer;
    };

    // Keep Ref updated
    useEffect(() => {
        startActualCallRef.current = startActualCall;
    });

    // 2. Answer Call
    const answerCall = async () => {
        stopRingtone(); // Stop Incoming Ring
        playSound('connect');

        const currentStream = await getMedia();
        if (!currentStream || !socket) return;
        setCallAccepted(true);
        setCallStatus('connected');
        setIsMinimized(false);

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
        });

        peer.on('signal', (data) => {
            socket.emit('answer-call', { signal: data, to: otherUserId });
        });

        peer.on('stream', (userStream) => {
            playRemoteAudio(userStream);
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    // Helper: Play Remote Audio
    const playRemoteAudio = (userStream: MediaStream) => {
        const audio = new Audio();
        audio.srcObject = userStream;
        audio.play();
        remoteAudioRef.current = audio;
    };

    // 3. Permission Response
    const acceptVoiceRequest = (targetUserId: string, matchId: string, requestId: string, onMessageUpdate?: (msg: Message) => void) => {
        // Send 'from' explicitly so server doesn't have to look it up
        socket?.emit('voice-permission-accepted', {
            to: targetUserId,
            from: currentUser?.id
        });
        localStorage.setItem(`voice_perm_${targetUserId}`, 'true');

        // KEY FIX: Enable voice call on the Match object itself (Bidirectional)
        updateMatch(matchId, { voiceCallEnabled: true }); // Local update

        // PERSISTENCE FIX: Update DB via API
        // This ensures the other user pulls this status next time they load matches
        try {
            // We need to import matchesApi in this file first
            apiMatches.update(matchId, { voiceCallEnabled: true });
        } catch (e) { console.error("Failed to persist match voice enable", e); }

        const updateData: Partial<Message> = {
            type: 'call_accepted',
            content: "Voice Call accepted"
        };

        updateMessage(requestId, updateData);

        // PERSISTENCE FIX: Update DB
        apiMessages.update(requestId, updateData).catch(err => console.error("Failed to persist val accepted", err));

        socket?.emit("update-message", { messageId: requestId, updates: updateData, to: targetUserId });
        if (onMessageUpdate) onMessageUpdate(updateData as Message);
        setCallStatus('idle');
    };

    const rejectVoiceRequest = (targetUserId: string, requestId: string, onMessageUpdate?: (msg: Message) => void) => {
        socket?.emit('voice-permission-rejected', {
            to: targetUserId,
            from: currentUser?.id
        });

        const updateData: Partial<Message> = {
            type: 'call_declined',
            content: "Voice Call declined"
        };

        updateMessage(requestId, updateData);

        // PERSISTENCE FIX: Update DB
        apiMessages.update(requestId, updateData).catch(err => console.error("Failed to persist call declined", err));

        socket?.emit("update-message", { messageId: requestId, updates: updateData, to: targetUserId });
        if (onMessageUpdate) onMessageUpdate(updateData as Message);

        setCallStatus('idle');
        setIsMinimized(false);
    };

    // 4. Leave Call
    const leaveCall = () => {
        stopRingtone(); // Ensure ringtone stops
        playSound('end');

        if (callStatus === 'connected') {
            const durationText = formatDuration(callDuration);
            const logMsg: Message = {
                id: generateId(),
                matchId: currentMatchId || 'unknown', // Need to make sure this is set
                senderId: currentUser?.id || '',
                receiverId: otherUserId,
                type: 'call_log',
                content: `Call ended • ${durationText}`,
                isRead: true,
                isDelivered: true,
                isSeen: false,
                deletedFor: [],
                isDeleted: false,
                createdAt: new Date().toISOString()
            };

            // Save Locally
            addMessage(logMsg);
            apiMessages.send(logMsg).catch(e => console.error("Failed to save call log", e));

            // Log to Other User
            socket?.emit("send-message", {
                ...logMsg,
                text: logMsg.content
            });
        }
        else if (callStatus === 'incoming') {
            // Rejected the call by ME (the callee)
            socket?.emit('reject-call', { to: otherUserId });
            // The caller (remote) will handle the 'call-rejected' event and show 'Call Declined' (handled in call-rejected listener)
        }
        else if (callStatus === 'outgoing' || callStatus === 'requesting') {
            // Cancelled by ME (the caller) -> Missed Call for THEM
            const missedMsg: Message = {
                id: generateId(),
                matchId: currentMatchId || 'unknown',
                senderId: currentUser?.id || '',
                receiverId: otherUserId,
                type: 'missed_call',
                content: "Missed Call",
                isRead: false,
                isDelivered: true,
                isSeen: false,
                deletedFor: [],
                isDeleted: false,
                createdAt: new Date().toISOString()
            };

            addMessage(missedMsg);
            apiMessages.send(missedMsg).catch(e => console.error("Failed to save missed call", e));
            socket?.emit("send-message", { ...missedMsg, text: "Missed Call" });
        }

        setCallEnded(true);
        connectionRef.current?.destroy();
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setCallStatus('idle');
        setIsMinimized(false);
        setCallDuration(0);
        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current = null;
        }
    };

    // Utilities
    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // TIMEOUT LOGIC
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (callStatus === 'requesting' || callStatus === 'outgoing') {
            // 30s Timeout for Caller
            timeout = setTimeout(() => {
                toast.error("User is not answering...");
                stopRingtone();

                // Generate Missed Call Log
                const missedMsg: Message = {
                    id: generateId(),
                    matchId: currentMatchId || 'unknown',
                    senderId: currentUser?.id || '',
                    receiverId: otherUserId,
                    type: 'missed_call',
                    content: "Missed Call",
                    isRead: false,
                    isDelivered: true,
                    isSeen: false,
                    deletedFor: [],
                    isDeleted: false,
                    createdAt: new Date().toISOString()
                };

                // Save Locally for ME
                addMessage(missedMsg);

                // PERSISTENCE FIX: Save to DB
                apiMessages.send(missedMsg).catch(err => console.error("Failed to persist missed call", err));

                // Send to Other User
                socket?.emit("send-message", {
                    ...missedMsg,
                    text: "Missed Call"
                });

                setCallStatus('idle');
                connectionRef.current?.destroy();
                stream?.getTracks().forEach(track => track.stop());
                setStream(null);
            }, 30000);
        }
        return () => clearTimeout(timeout);
    }, [callStatus, otherUserId, socket, currentUser, currentMatchId]);

    // Button Handlers
    const toggleMute = () => {
        if (stream) {
            // Toggle all audio tracks
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted); // Update state based on previous state
        }
    };

    const toggleSpeaker = async () => {
        // Note: setSinkId is experimental and only on some browsers
        setIsSpeakerOn(!isSpeakerOn);
        if (remoteAudioRef.current && (remoteAudioRef.current as any).setSinkId) {
            try {
                // Just logging for now as we don't have device IDs enum
                console.log("Attempting to switch audio output...");
            } catch (e) {
                console.error("Error switching speaker", e);
            }
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <SocketContext.Provider value={{
            callUser,
            acceptVoiceRequest,
            rejectVoiceRequest,
            socket,
            onlineUsers
        }}>
            {children}

            {/* Render Mini Player if Minimized */}
            {isMinimized && callStatus !== 'idle' && (
                <MiniCallPlayer
                    callerName={callerName}
                    callerImage={callerImage}
                    status={callStatus}
                    duration={callDuration}
                    onMaximize={() => setIsMinimized(false)}
                    onEnd={leaveCall}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                />
            )}

            {/* Render Full Screen if NOT Minimized */}
            {!isMinimized && callStatus !== 'idle' && (
                <CallModal
                    status={callStatus}
                    callerName={callerName}
                    callerImage={callerImage}
                    onAnswer={answerCall}
                    onReject={leaveCall}
                    onEnd={leaveCall}
                    onAcceptRequest={() => acceptVoiceRequest(otherUserId, currentMatchId || 'unknown', 'legacy_request')}
                    onRejectRequest={() => rejectVoiceRequest(otherUserId, 'legacy_request')}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onMinimize={toggleMinimize} // Now works
                />
            )}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
