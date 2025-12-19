const mongoose = require('mongoose');
const User = require('./models/User');
const VerificationRequest = require('./models/VerificationRequest');
const MONGO_URI = "mongodb+srv://velviiorg_db_user:lvqyDCYBapnMa67y@cluster0.hbnzuhp.mongodb.net/VelviiDB?appName=Cluster0";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const checkVerifications = async () => {
    await connectDB();

    try {
        const requests = await VerificationRequest.find({});
        console.log(`Found ${requests.length} verification requests.`);

        for (const req of requests) {
            console.log(`\nRequest ID: ${req._id}`);
            console.log(`Status: ${req.status}`);
            console.log(`User ID in request: ${req.userId}`);

            // Check if userId is valid ObjectId
            let isValidId = mongoose.Types.ObjectId.isValid(req.userId);
            console.log(`Is User ID valid ObjectId? ${isValidId}`);

            if (isValidId) {
                const user = await User.findById(req.userId);
                console.log(`User found in DB? ${!!user}`);
                if (user) {
                    console.log(`User: ${user.fullName} (${user.email})`);
                    console.log(`User Verified Status: ${user.isVerified}`);
                }
            } else {
                console.log('WARNING: stored userId is NOT a valid MongoDB ObjectId.');
            }
        }

    } catch (error) {
        console.error('Error checking verifications:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkVerifications();
