const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Explicit Custom ID
    user1Id: { type: String, required: true, ref: 'User' },
    user2Id: { type: String, required: true, ref: 'User' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount1: { type: Number, default: 0 },
    unreadCount2: { type: Number, default: 0 },
    voiceCallEnabled: { type: Boolean, default: false }
}, { timestamps: true });

matchSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Match', matchSchema);
