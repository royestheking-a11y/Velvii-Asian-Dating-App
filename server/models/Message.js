const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: String }, // Frontend generated UUID
    matchId: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'image', 'voice', 'call_request', 'call_accepted', 'call_declined', 'call_log', 'missed_call'],
        default: 'text'
    },
    content: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
    deletedFor: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        if (!ret.id && ret._id) {
            ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Message', messageSchema);
