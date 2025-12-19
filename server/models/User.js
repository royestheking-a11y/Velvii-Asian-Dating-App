const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    dateOfBirth: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    interestedIn: { type: String, enum: ['men', 'women', 'everyone'], required: true },
    lookingFor: { type: String, default: 'relationship' },
    showMeCriteria: [{ type: String }], // 'man', 'woman', 'nonbinary', 'everyone'
    photos: [{ type: String }],
    bio: { type: String, default: '' },
    interests: [{ type: String }],
    height: { type: Number },
    education: { type: String },
    job: { type: String },
    occupation: { type: String },
    relationshipStatus: { type: String },
    location: {
        city: { type: String },
        country: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    isAutoLocation: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    isPremium: { type: Boolean, default: false },
    premiumUntil: { type: Date },
    instantCircleEnabled: { type: Boolean, default: false },
    friendzoneModeEnabled: { type: Boolean, default: false },

    // Stats
    swipeCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    matchCount: { type: Number, default: 0 },
    superLikesRemaining: { type: Number, default: 1 },
    boostsRemaining: { type: Number, default: 0 },

    // Roles/Flags
    isAI: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    diamonds: { type: Number, default: 0 },

    // Preferences / Settings
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            matches: { type: Boolean, default: true },
            likes: { type: Boolean, default: true },
            messages: { type: Boolean, default: true }
        },
        privacy: {
            showOnlineStatus: { type: Boolean, default: true },
            showLastActive: { type: Boolean, default: true },
            showDistance: { type: Boolean, default: true },
            hideAge: { type: Boolean, default: false },
            onlyShowToLiked: { type: Boolean, default: false },
            privatePhotos: { type: Boolean, default: false },
            incognitoMode: { type: Boolean, default: false },
            showCisgenderOnly: { type: Boolean, default: false }
        },
        data: {
            darkMode: { type: Boolean, default: false },
            autoDownloadMedia: { type: Boolean, default: true }
        }
    },

    // Timestamps
}, { timestamps: true });

// Virtual for ID
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.password; // Don't return password
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
