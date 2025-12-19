const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { cloudinary } = require('../config/cloudinary');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, username, photos } = req.body;

        // Check existing
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Process Photos: Upload Base64 to Cloudinary
        let processedPhotos = [];
        if (photos && Array.isArray(photos)) {
            try {
                const uploadPromises = photos.map(async (photo) => {
                    if (photo.startsWith('data:image')) {
                        // It's a base64 string, upload to Cloudinary
                        const result = await cloudinary.uploader.upload(photo, {
                            folder: 'velvii/users',
                            resource_type: 'image'
                        });
                        return result.secure_url;
                    }
                    return photo; // Already a URL (e.g. default)
                });
                processedPhotos = await Promise.all(uploadPromises);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                // Fallback: Proceed with original photos but warn? 
                // Or fail? Failing is safer to prevent broken profiles.
                return res.status(500).json({ error: 'Failed to upload profile photos' });
            }
        }

        const userData = {
            ...req.body,
            photos: processedPhotos.length > 0 ? processedPhotos : req.body.photos
        };

        const newUser = new User(userData);
        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Direct Admin Access Check (as per original code)
        if (email === 'admin@velvii.com' && password === 'velvii878') {
            // Return the special admin session object (not saved in DB)
            return res.json({
                id: 'admin-session',
                email: 'admin@velvii.com',
                fullName: 'Velvii Administrator',
                username: 'velvii_admin',
                isAdmin: true,
                // ... other minimal fields needed by frontend
                isPremium: true,
                dateOfBirth: '1990-01-01', // Default DOB for admin
                photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80']
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Simple password check (In production, use bcrypt!)
        // For migration, we assume plaintext passwords as per original seed data
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update last active
        user.lastActive = new Date();
        user.isOnline = true;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
