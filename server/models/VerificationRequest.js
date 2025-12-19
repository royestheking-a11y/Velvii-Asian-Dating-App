const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    photos: [{ type: String, required: true }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

verificationRequestSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
