const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, enum: ['bug', 'feature', 'billing', 'other'], default: 'other' },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' }
}, { timestamps: true });

feedbackSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
