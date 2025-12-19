const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    type: { type: String, enum: ['like', 'superlike'], default: 'like' }
}, { timestamps: true });

likeSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Like', likeSchema);
