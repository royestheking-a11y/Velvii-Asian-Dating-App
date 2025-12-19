const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'urgent'], default: 'info' },
    targetAudience: { type: String, enum: ['all', 'premium', 'free'], default: 'all' },
    sentAt: { type: Date, default: Date.now },
    readCount: { type: Number, default: 0 }
}, { timestamps: true });

broadcastSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Broadcast', broadcastSchema);
