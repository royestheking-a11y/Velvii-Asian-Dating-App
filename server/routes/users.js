const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { upload } = require('../config/cloudinary');

// Get all users (with filtering)
router.get('/', async (req, res) => {
    try {
        const { gender, minAge, maxAge, excludeId } = req.query;
        let query = {};

        if (excludeId) {
            query._id = { $ne: excludeId }; // Don't show self
        }

        if (gender && gender !== 'everyone') {
            query.gender = gender;
        }

        // Age filtering would require converting string DoB to date objects or using the 'age' field if reliable
        // For now, simple return

        // Default limit to avoid loading everything
        const users = await User.find(query).limit(50);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Upload Photo (Cloudinary)
router.post('/:id/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const startPhotoUrl = req.file.path; // Cloudinary URL

        // Update user photos
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.photos.push(startPhotoUrl);
        await user.save();

        res.json({ url: startPhotoUrl, user });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: 'Error uploading photo' });
    }
});

const VerificationRequest = require('../models/VerificationRequest');

// ... existing code ...

// Submit Verification Request
router.post('/verify', async (req, res) => {
    try {
        const { userId, selfieUrl, photos } = req.body;

        // Check if pending request already exists
        const existingRequest = await VerificationRequest.findOne({ userId, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ error: 'Verification request already pending' });
        }

        // Handle selfieUrl vs photos array (schema expects photos array usually, based on recent admin usage)
        // Checking model: photos: [{ type: String, required: true }]
        // Frontend sends selfieUrl.

        const photoArray = photos || (selfieUrl ? [selfieUrl] : []);

        const request = await VerificationRequest.create({
            userId,
            photos: photoArray,
            status: 'pending'
        });

        res.json(request);
    } catch (error) {
        console.error("Verification Submission Error:", error);
        res.status(500).json({ error: 'Failed to submit verification request' });
    }
});

// Check Verification Status
router.get('/:id/verification', async (req, res) => {
    try {
        const request = await VerificationRequest.findOne({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(request || null); // Return null if no request found
    } catch (error) {
        res.status(500).json({ error: 'Error checking verification status' });
    }
});

// Create Subscription
router.post('/subscribe', async (req, res) => {
    try {
        const { userId, plan, price, duration } = req.body; // duration: 'weekly', 'monthly', 'yearly'

        let daysToAdd = 30;
        if (duration === 'weekly') daysToAdd = 7;
        if (duration === 'yearly') daysToAdd = 365;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysToAdd);

        // 1. Create Subscription Record
        const Subscription = require('../models/Subscription');
        const subscription = await Subscription.create({
            userId,
            plan: duration, // mapping duration to plan field
            price,
            startDate: new Date(),
            endDate: endDate,
            status: 'active'
        });

        // 2. Update User
        const user = await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumUntil: endDate,
            $inc: {
                diamonds: 10,
                superLikesRemaining: 10,
                boostsRemaining: 5
            }
        }, { new: true });

        res.json({ subscription, user });
    } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).json({ error: 'Error processing subscription' });
    }
});

module.exports = router;
