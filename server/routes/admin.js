const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
const VerificationRequest = require('../models/VerificationRequest');
const Broadcast = require('../models/Broadcast');
const PremiumPackage = require('../models/PremiumPackage');
const Feedback = require('../models/Feedback');
const { v4: uuidv4 } = require('uuid');
const SwipeAction = require('../models/SwipeAction');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
const { upload } = require('../config/cloudinary');

// Generic Admin Image Upload
router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    } catch (error) {
        console.error("Admin Upload Error:", error);
        res.status(500).json({ error: 'Error uploading photo' });
    }
});

// Admin Stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalMatches = await Match.countDocuments({});
        const totalMessages = await Message.countDocuments({});
        const totalSwipes = await SwipeAction.countDocuments({});
        const pendingReports = await Report.countDocuments({ status: 'pending' });

        // Enhanced Stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        const activeNow = await User.countDocuments({ isOnline: true });
        const premiumUsers = await User.countDocuments({ isPremium: true });
        const dau = await User.countDocuments({ lastActive: { $gte: oneDayAgo } });
        const mau = await User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } });
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const aiUsers = await User.countDocuments({ isAI: true });

        // Recent Users (Top 5)
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('id fullName photos isPremium isVerified isOnline createdAt');

        // Revenue Stats
        // 1. Get real subscriptions from database
        const subscriptions = await Subscription.find({ status: 'active' });

        let calculatedMonthlyRevenue = 0;
        let calculatedYearlyRevenue = 0;

        // 2. Map of user IDs with active subscriptions
        const userIdsWithSubscription = new Set(subscriptions.map(s => s.userId));

        // 3. Add up real subscriptions
        subscriptions.forEach(sub => {
            if (sub.plan === 'monthly' || sub.plan === 'weekly') {
                calculatedMonthlyRevenue += sub.price;
            } else if (sub.plan === 'yearly') {
                calculatedYearlyRevenue += sub.price;
            }
        });

        // 4. Fallback for Premium Users with NO Subscription Record
        // Assume they are Monthly @ 29.99 if not found in subscription table
        const orphanPremiumUsers = await User.find({
            isPremium: true,
            id: { $nin: Array.from(userIdsWithSubscription) }
        });

        orphanPremiumUsers.forEach(user => {
            calculatedMonthlyRevenue += 29.99;
        });

        const monthlyRevenue = Math.round(calculatedMonthlyRevenue * 100) / 100;
        const yearlyRevenue = Math.round(calculatedYearlyRevenue * 100) / 100;

        // Total Revenue (Accumulated Active Value) - as per user request to include monthly in total
        const totalRevenue = monthlyRevenue + yearlyRevenue;

        // Daily Revenue (Run Rate)
        const dailyRevenue = Math.round((monthlyRevenue / 30) * 100) / 100;

        // Engagement Metrics
        const activeConversations = await Match.countDocuments({ lastMessage: { $exists: true, $ne: null } });
        const messagesSentToday = await Message.countDocuments({ createdAt: { $gte: startOfToday } });
        const engagementRate = totalUsers > 0 ? Math.round((dau / totalUsers) * 100) : 0;
        const avgSessionTime = 12.5; // Placeholder until session tracking is implemented

        // Calculate Match Rate
        const matchRate = totalSwipes > 0 ? Math.round((totalMatches / totalSwipes) * 100) : 0;

        res.json({
            totalUsers,
            totalMatches,
            totalMessages,
            totalSwipes,
            pendingReports,
            activeNow,
            premiumUsers,
            dau,
            mau,
            newUsersToday,
            verifiedUsers,
            aiUsers,
            recentUsers,
            matchRate,
            engagementRate,
            activeConversations,
            messagesSentToday,
            avgSessionTime,
            monthlyRevenue,
            yearlyRevenue,
            totalRevenue,
            dailyRevenue
        });
    } catch (error) {
        console.error("Admin Stats Error", error);
        res.status(500).json({ error: 'Error fetching admin stats' });
    }
});

// Admin Users List (Detailed with Stats)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        // Enhance with stats for each user (Match Count, Swipe Count)
        // Note: For large datasets, this N+1 query approach is slow. 
        // Ideal: Use aggregation pipeline. For now (MVP/Low Traffic), Promise.all is acceptable.

        const detailedUsers = await Promise.all(users.map(async (user) => {
            const matchCount = await Match.countDocuments({
                $or: [{ user1Id: user.id }, { user2Id: user.id }]
            });

            const swipeCount = await SwipeAction.countDocuments({ userId: user.id });
            const likeCount = await SwipeAction.countDocuments({ targetUserId: user.id, action: { $in: ['like', 'superlike'] } });

            return {
                ...user.toJSON(),
                matchCount,
                swipeCount,
                likeCount
            };
        }));

        res.json(detailedUsers);
    } catch (error) {
        console.error("Admin Users Error", error);
        res.status(500).json({ error: 'Error fetching admin users' });
    }
});

// Update User (Admin Override)
router.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Clean up related data (matches, messages, etc.) if needed in future
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// --- Broadcasts ---
router.post('/broadcast', async (req, res) => {
    try {
        const { title, message, type, targetAudience } = req.body;

        // 1. Create Broadcast Record
        const broadcast = await Broadcast.create({
            title, message, type, targetAudience
        });

        // 2. Send to users (Simulated by creating matches/messages with Team Velvii)
        // Find Team Velvii user
        const teamUser = await User.findOne({ username: 'team_velvii' });
        if (!teamUser) return res.status(500).json({ error: 'Team Velvii account not found' });

        // Determine recipients
        let query = { isAdmin: false, isAI: false }; // Base: Real users only
        if (targetAudience === 'premium') query.isPremium = true;
        if (targetAudience === 'free') query.isPremium = false;

        const recipients = await User.find(query);
        let sentCount = 0;

        for (const recipient of recipients) {
            // Check for existing match
            let match = await Match.findOne({
                $or: [
                    { user1Id: teamUser.id, user2Id: recipient.id },
                    { user1Id: recipient.id, user2Id: teamUser.id }
                ]
            });

            if (!match) {
                match = await Match.create({
                    user1Id: teamUser.id,
                    user2Id: recipient.id,
                    unreadCount1: 0,
                    unreadCount2: 0,
                    lastMessage: message,
                    createdAt: new Date().toISOString()
                });
            }

            // Create Message
            await Message.create({
                matchId: match.matchId || `${teamUser.id}_${recipient.id}`, // Fallback if virtual matchId logic differs
                senderId: teamUser.id,
                receiverId: recipient.id,
                content: message,
                createdAt: new Date().toISOString()
            });

            // Update Match
            match.lastMessage = message;
            match.unreadCount2 += 1; // Assuming team is user1, recipient is user2. Logic needs to be robust.
            // A safer update:
            if (match.user1Id === recipient.id) match.unreadCount1 += 1;
            else match.unreadCount2 += 1;

            await match.save();
            sentCount++;
        }

        res.json({ success: true, broadcast, sentCount });
    } catch (error) {
        console.error("Broadcast Error", error);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
});

// --- Feedback ---
router.get('/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feedback' });
    }
});

router.patch('/feedback/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: 'Error updating feedback' });
    }
});

// --- Verification Requests ---
router.get('/verification-requests', async (req, res) => {
    try {
        const requests = await VerificationRequest.find({}).sort({ createdAt: -1 });
        // Enhance with user details
        const enhancedRequests = await Promise.all(requests.map(async (req) => {
            const user = await User.findById(req.userId).select('fullName email photos username');
            const requestObj = req.toJSON();
            return {
                ...requestObj,
                user,
                selfieUrl: requestObj.photos && requestObj.photos.length > 0 ? requestObj.photos[0] : null
            };
        }));
        res.json(enhancedRequests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching verification requests' });
    }
});

router.post('/verification-requests/:id/review', async (req, res) => {
    try {
        const { status } = req.body; // approved / rejected
        console.log(`[Admin] Reviewing request ${req.params.id} with status ${status}`);

        const request = await VerificationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!request) {
            console.error(`[Admin] Verification request ${req.params.id} not found`);
            return res.status(404).json({ error: 'Request not found' });
        }

        if (status === 'approved') {
            console.log(`[Admin] Approving user ${request.userId}`);
            const user = await User.findByIdAndUpdate(request.userId, { isVerified: true }, { new: true });
            if (!user) {
                console.error(`[Admin] User ${request.userId} not found for verification approval`);
                // Check if we can find by custom ID field if schema uses it
                const userByCustomId = await User.findOneAndUpdate({ id: request.userId }, { isVerified: true }, { new: true });
                if (!userByCustomId) console.error(`[Admin] User also not found by custom id field`);
            }
        }

        res.json(request);
    } catch (error) {
        console.error("[Admin] Verification Review Error:", error);
        res.status(500).json({ error: 'Error processing verification' });
    }
});

// --- Packages ---
router.get('/packages', async (req, res) => {
    try {
        const packages = await PremiumPackage.find({});
        res.json(packages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching packages' });
    }
});

router.patch('/packages/:id', async (req, res) => {
    try {
        const pkg = await PremiumPackage.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ error: 'Error updating package' });
    }
});

// --- Reports ---
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ createdAt: -1 });

        // Populate Reporter and Reported User details
        // Note: Using Promise.all for manual population if mongoose .populate() isn't set up perfectly or for simple flexibility
        const detailedReports = await Promise.all(reports.map(async (report) => {
            const reporter = await User.findById(report.reporterId).select('id fullName username photos');
            const reported = await User.findById(report.reportedUserId).select('id fullName username photos');

            return {
                ...report.toJSON(),
                reporter,
                reported
            };
        }));

        res.json(detailedReports);
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

router.patch('/reports/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updates = {
            status,
            reviewedAt: new Date(),
            reviewedBy: 'admin' // In a real app, this would be req.user.id
        };

        const report = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(report);
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: 'Error updating report' });
    }
});

module.exports = router;
