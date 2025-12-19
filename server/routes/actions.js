const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const SwipeAction = require('../models/SwipeAction');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const User = require('../models/User');

const Report = require('../models/Report');
const Feedback = require('../models/Feedback');

// Create Feedback
router.post('/feedback', async (req, res) => {
    try {
        const { userId, type, message, rating } = req.body;

        // Map frontend 'type' to backend 'category' if needed, or just store as is.
        // Schema says 'category' enum: ['bug', 'feature', 'billing', 'other']. 
        // Frontend sends: 'suggestion', 'bug', 'content', 'other'.
        // Mapping: 'suggestion' -> 'feature', 'content' -> 'other' (or update schema).
        // Let's stick to schema enum for safety or update schema. 
        // Implementation Plan said "mapped to category".

        let category = 'other';
        if (type === 'bug') category = 'bug';
        if (type === 'suggestion') category = 'feature';

        const newFeedback = new Feedback({
            userId,
            category,
            message,
            rating,
            status: 'new'
        });

        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        console.error("Feedback Error", error);
        res.status(500).json({ error: 'Error submitting feedback' });
    }
});

// Create a Report (User reporting another user)
router.post('/report', async (req, res) => {
    try {
        const { reporterId, reportedUserId, reason, details } = req.body;

        const newReport = new Report({
            reporterId,
            reportedUserId,
            reason,
            details,
            status: 'pending'
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error("Report Error", error);
        res.status(500).json({ error: 'Error submitting report' });
    }
});

// Record a Swipe Action (Analytics/History)
router.post('/swipe', async (req, res) => {
    try {
        const { userId, targetUserId, action } = req.body;
        const newSwipe = new SwipeAction({ userId, targetUserId, action });
        await newSwipe.save();

        // Increment swipe count for user
        await User.updateOne({ _id: userId }, { $inc: { swipeCount: 1 } });

        res.json(newSwipe);
    } catch (error) {
        res.status(500).json({ error: 'Error recording swipe' });
    }
});

// Record a Like (and check for Match)
router.post('/like', async (req, res) => {
    try {
        const { fromUserId, toUserId, type } = req.body;

        const newLike = new Like({ fromUserId, toUserId, type });
        await newLike.save();

        // Check for Mutual Like
        let mutualLike = await Like.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId
        });

        // AI AUTO-MATCH RULE: If target is AI, force a mutual like
        // Check by _id (standard) or id (custom)
        const targetUser = await User.findOne({
            $or: [{ _id: toUserId }, { id: toUserId }]
        });
        if (targetUser && targetUser.isAI) {
            const aiLike = new Like({
                fromUserId: toUserId,
                toUserId: fromUserId,
                type: 'like'
            });
            await aiLike.save();
            mutualLike = aiLike;
        }

        let match = null;

        if (mutualLike) {
            // Check if match already exists to prevent duplicates
            const existingMatch = await Match.findOne({
                $or: [
                    { user1Id: fromUserId, user2Id: toUserId },
                    { user1Id: toUserId, user2Id: fromUserId }
                ]
            });

            if (existingMatch) {
                // Return existing match
                return res.json({ like: newLike, match: existingMatch });
            }

            // Create Match
            const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            match = new Match({
                id: matchId, // Explicitly set ID for consistency
                user1Id: fromUserId, // Real User
                user2Id: toUserId,   // Target (AI or Real)
                unreadCount1: 0,
                unreadCount2: 0,
                createdAt: new Date()
            });

            // AI AUTO-REPLY RULE: If target is AI, send a greeting
            if (targetUser && targetUser.isAI) {
                const Message = require('../models/Message'); // Lazy import loop avoidance

                // Pick a random greeting
                const greetings = [
                    "Hey! Thanks for the like 😊",
                    "Hi there! Nice to match with you!",
                    "Hello! How's your day going?",
                    "Hey! I liked your profile 💫"
                ];
                const cleanGreeting = greetings[Math.floor(Math.random() * greetings.length)];

                const aiMsg = new Message({
                    matchId: match.id, // Use the generated ID
                    senderId: toUserId,
                    receiverId: fromUserId,
                    content: cleanGreeting,
                    type: 'text',
                    createdAt: new Date(),
                    isRead: false
                });
                await aiMsg.save();

                match.lastMessage = cleanGreeting;
                match.lastMessageAt = new Date();
                match.unreadCount1 = 1; // User has 1 unread message
            }

            await match.save();

            // Create Notifications
            const notif1 = new Notification({
                userId: fromUserId,
                type: 'match',
                title: 'It\'s a Match! 💖',
                message: `You matched with ${targetUser ? targetUser.fullName : 'someone'}!`,
                isRead: false
            });

            // Only send notification to real user (not AI)
            const notifPromises = [notif1.save()];

            if (targetUser && !targetUser.isAI) {
                const notif2 = new Notification({
                    userId: toUserId,
                    type: 'match',
                    title: 'New Match!',
                    message: 'You have a new match!',
                    isRead: false
                });
                notifPromises.push(notif2.save());
            }

            await Promise.all(notifPromises);
        }

        res.json({ like: newLike, match });
    } catch (error) {
        console.error("Like Error", error);
        res.status(500).json({ error: 'Error recording like' });
    }
});

// Get Likes for a user (People who liked them)
router.get('/likes/:userId', async (req, res) => {
    try {
        // Find likes where toUserId is the current user
        const likes = await Like.find({ toUserId: req.params.userId }).sort({ createdAt: -1 });

        // Populate From User Details
        const populatedLikes = await Promise.all(likes.map(async (like) => {
            const user = await User.findOne({
                $or: [
                    { _id: like.fromUserId },
                    { id: like.fromUserId }
                ]
            });
            // Add isSuperLike flag based on type
            return user ? { user, createdAt: like.createdAt, action: like.type } : null;
        }));

        res.json(populatedLikes.filter(l => l !== null));
    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ error: 'Error fetching likes' });
    }
});

// Get Swipe History for a user
router.get('/swipes/:userId', async (req, res) => {
    try {
        const swipes = await SwipeAction.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        // Populate Target User Details
        const populatedSwipes = await Promise.all(swipes.map(async (swipe) => {
            const user = await User.findOne({
                $or: [
                    { _id: swipe.targetUserId },
                    { id: swipe.targetUserId }
                ]
            });
            return user ? { ...swipe.toJSON(), user } : null;
        }));

        res.json(populatedSwipes.filter(s => s !== null));
    } catch (error) {
        console.error("Error fetching swipes:", error);
        res.status(500).json({ error: 'Error fetching swipe history' });
    }
});

module.exports = router;
