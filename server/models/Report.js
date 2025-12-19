const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: { type: String, required: true },
    reportedUserId: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });

reportSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Report', reportSchema);
