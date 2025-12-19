const mongoose = require('mongoose');

const swipeActionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    targetUserId: { type: String, required: true },
    action: { type: String, enum: ['like', 'nope', 'superlike'], required: true }
}, { timestamps: true });

swipeActionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('SwipeAction', swipeActionSchema);
