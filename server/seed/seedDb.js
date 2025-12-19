const mongoose = require('mongoose');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
const SwipeAction = require('../models/SwipeAction');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
// New Models
const VerificationRequest = require('../models/VerificationRequest');
const Broadcast = require('../models/Broadcast');
const PremiumPackage = require('../models/PremiumPackage');
const Feedback = require('../models/Feedback');

const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// --- Full Data Definitions ---

const ADMIN_USER = {
    email: 'admin@velvii.app',
    password: 'admin123',
    fullName: 'Admin User',
    username: 'velvii_admin',
    initialId: 'admin_user_id',
    dateOfBirth: '1990-01-01',
    age: 34,
    gender: 'male',
    interestedIn: 'everyone',
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80'],
    bio: 'Velvii Admin Account',
    interests: ['Management', 'Tech', 'Analytics'],
    location: { city: 'San Francisco', country: 'USA' },
    isVerified: true,
    isOnline: true,
    isPremium: true,
    isAdmin: true,
    createdAt: new Date().toISOString()
};

const TEAM_USER = {
    email: 'team@velvii.app',
    password: 'secureSystemPassword',
    fullName: 'Team Velvii',
    username: 'team_velvii',
    initialId: 'team_velvii_id',
    dateOfBirth: '2023-01-01',
    age: 1,
    gender: 'female',
    interestedIn: 'everyone',
    photos: ['/favicon-96x96.png'],
    bio: 'Official Team Velvii Account',
    interests: ['Community', 'Support', 'Updates'],
    location: { city: 'Internet', country: 'Global' },
    isVerified: true,
    isOnline: true,
    isPremium: true,
    isAdmin: true,
    createdAt: new Date().toISOString()
};

const ALL_AI_USERS = [
    {
        email: 'emma.ai@velvii.app',
        fullName: 'Emma Anderson',
        username: 'emma_adventures',
        initialId: 'ai_emma',
        age: 28, gender: 'female',
        dateOfBirth: '1996-05-15',
        photos: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80'
        ],
        bio: "Adventure seeker ✨ Love hiking, photography, and good coffee.",
        interests: ['Travel', 'Photography', 'Hiking'],
        location: { city: 'San Francisco', country: 'USA' },
        isAI: true, isVerified: true, isOnline: true
    },
    {
        email: 'sophia.ai@velvii.app',
        fullName: 'Sophia Chen',
        username: 'sophia_artsy',
        initialId: 'ai_sophia',
        age: 26, gender: 'female',
        dateOfBirth: '1998-08-22',
        photos: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80'
        ],
        bio: "Artist & dreamer 🎨 Gallery hopping and indie movies.",
        interests: ['Art', 'Movies', 'Photography'],
        location: { city: 'New York', country: 'USA' },
        isAI: true, isVerified: true, isOnline: false
    },
    {
        email: 'olivia.ai@velvii.app',
        fullName: 'Olivia Martinez',
        username: 'liv_fitness',
        initialId: 'ai_olivia',
        age: 29, gender: 'female',
        dateOfBirth: '1995-03-10',
        photos: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80'
        ],
        bio: "Fitness enthusiast 💪 Yoga instructor by day.",
        interests: ['Fitness', 'Yoga', 'Cooking'],
        location: { city: 'Los Angeles', country: 'USA' },
        isAI: true, isVerified: true, isOnline: true
    },
    {
        email: 'alex.ai@velvii.app',
        fullName: 'Alex Thompson',
        username: 'alex_tech',
        initialId: 'ai_alex',
        age: 30, gender: 'male',
        dateOfBirth: '1994-11-20',
        photos: [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80'
        ],
        bio: "Tech entrepreneur 💻 Building the future.",
        interests: ['Tech', 'Startups', 'Music'],
        location: { city: 'Seattle', country: 'USA' },
        isAI: true, isVerified: true, isOnline: true
    },
    {
        email: 'james.ai@velvii.app',
        fullName: 'James Rodriguez',
        username: 'james_outdoors',
        initialId: 'ai_james',
        age: 27, gender: 'male',
        dateOfBirth: '1997-07-08',
        photos: [
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80'
        ],
        bio: "Mountain lover 🏔️ Rock climbing and camping.",
        interests: ['Hiking', 'Camping', 'Cycling'],
        location: { city: 'Denver', country: 'USA' },
        isAI: true, isVerified: true, isOnline: false
    },
    {
        email: 'michael.ai@velvii.app',
        fullName: 'Michael Kim',
        username: 'mike_creative',
        initialId: 'ai_michael',
        age: 28, gender: 'male',
        dateOfBirth: '1996-02-14',
        photos: [
            'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80',
            'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=800&q=80',
            'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&q=80'
        ],
        bio: "Creative director 🎸 Love live music.",
        interests: ['Music', 'Dancing', 'Art'],
        location: { city: 'Austin', country: 'USA' },
        isAI: true, isVerified: true, isOnline: true
    }
];

const PACKAGES = [
    { id: 'plus_weekly', name: 'Velvii Plus - Weekly', price: 9.99, duration: '1 week', features: ['Unlimited Swipes', 'No Ads'], tier: 'plus' },
    { id: 'gold_weekly', name: 'Velvii Gold - Weekly', price: 19.99, duration: '1 week', features: ['See Who Likes You', 'Boosts'], tier: 'gold' },
    { id: 'platinum_weekly', name: 'Velvii Platinum - Weekly', price: 29.99, duration: '1 week', features: ['Priority Likes', 'Message Before Match'], tier: 'platinum' }
];

const uploadImageToCloudinary = async (imagePath, username) => {
    try {
        console.log(`☁️ Uploading for ${username}: ${imagePath}`);

        let uploadSource = imagePath;
        if (imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            uploadSource = path.join(__dirname, '../../public', imagePath);
        }

        const result = await cloudinary.uploader.upload(uploadSource, {
            folder: 'velvii/seeds',
            public_id: `${username}_avatar_${Date.now()}`,
            overwrite: true
        });

        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`   ❌ Upload Failed for ${imagePath}:`, error.message);
        return imagePath;
    }
};

const seedDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://velviiorg_db_user:lvqyDCYBapnMa67y@cluster0.hbnzuhp.mongodb.net/VelviiDB?appName=Cluster0";
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB for Seeding...");

        console.log("⚠️  Clearing OLD Data...");
        await User.deleteMany({});
        await Match.deleteMany({});
        await Message.deleteMany({});
        await SwipeAction.deleteMany({});
        await Report.deleteMany({});
        await Subscription.deleteMany({});
        await VerificationRequest.deleteMany({});
        await Broadcast.deleteMany({});
        await PremiumPackage.deleteMany({});
        await Feedback.deleteMany({});

        // --- 1. Seed Users ---
        console.log("👤 Seeding Users...");

        const processUser = async (userData) => {
            const processedPhotos = await Promise.all(
                userData.photos.map(photo => uploadImageToCloudinary(photo, userData.username))
            );

            const userDoc = await User.create({
                ...userData,
                interestedIn: userData.interestedIn || 'everyone',
                password: userData.password || 'ai_secure_password_123',
                id: userData.initialId || uuidv4(),
                photos: processedPhotos,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return { ...userDoc.toObject(), id: userDoc.id };
        };

        const admin = await processUser(ADMIN_USER);
        const team = await processUser(TEAM_USER);

        const aiUserDocs = [];
        for (const aiUser of ALL_AI_USERS) {
            const doc = await processUser(aiUser);
            aiUserDocs.push(doc);
        }

        // --- 2. Seed Matches & Messages ---
        console.log("❤️ Seeding Matches & Messages...");

        const emma = aiUserDocs.find(u => u.username === 'emma_adventures');
        if (emma) {
            await Match.create({
                user1Id: admin.id,
                user2Id: emma.id,
                unreadCount1: 0,
                unreadCount2: 1,
                lastMessage: "Hey! How's your day going? 😊",
                createdAt: new Date().toISOString()
            });

            await Message.create({
                matchId: `${admin.id}_${emma.id}`,
                senderId: emma.id,
                receiverId: admin.id,
                content: "Hey! How's your day going? 😊",
                createdAt: new Date().toISOString(),
                isRead: false
            });
        }

        // --- 3. Seed Admin Data ---
        console.log("🛠️ Seeding Admin Section Data...");

        // Reports
        const alex = aiUserDocs.find(u => u.username === 'alex_tech');
        if (alex) {
            await Report.create({
                reporterId: admin.id,
                reportedUserId: alex.id,
                reason: "Spam",
                details: "Testing report functionality",
                status: "pending"
            });
        }

        // Subscriptions
        await Subscription.create({
            userId: admin.id,
            plan: 'monthly',
            status: 'active',
            price: 29.99,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // Verification Requests
        const olivia = aiUserDocs.find(u => u.username === 'liv_fitness');
        if (olivia) {
            await VerificationRequest.create({
                userId: olivia.id,
                photos: [olivia.photos[0]], // Simulating verification photo
                status: 'pending'
            });
        }

        // Broadcasts
        await Broadcast.create({
            title: 'Welcome to Velvii!',
            message: 'We are excited to have you here. Check out the new features!',
            type: 'info',
            targetAudience: 'all'
        });

        // Feedback
        await Feedback.create({
            userId: admin.id,
            category: 'feature',
            message: 'It would be great to have dark mode!',
            rating: 5,
            status: 'new'
        });

        // Premium Packages
        for (const pkg of PACKAGES) {
            await PremiumPackage.create(pkg);
        }

        console.log("🌱 Full Seeding Complete with Image Migration & Admin Data!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
};

seedDB();
