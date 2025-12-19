const mongoose = require('mongoose');

const premiumPackageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g. 'plus_weekly'
    name: { type: String, required: true }, // 'Velvii Plus'
    price: { type: Number, required: true },
    duration: { type: String, required: true }, // '1 week', '1 month'
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    tier: { type: String, enum: ['plus', 'gold', 'platinum'], default: 'plus' }
}, { timestamps: true });

premiumPackageSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('PremiumPackage', premiumPackageSchema);
