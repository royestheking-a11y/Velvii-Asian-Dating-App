const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all matches for a user (Populated with User details and Last Message)
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const matches = await Match.find({
            $or: [{ user1Id: userId }, { user2Id: userId }]
        });

        const populatedMatches = await Promise.all(matches.map(async (match) => {
            // Determine the "other" user
            const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;

            // Fetch User Details
            const user = await User.findOne({ _id: otherUserId }); // Assuming _id is the String ID we store
            // If using custom id field instead of _id:
            // const user = await User.findOne({ id: otherUserId }); 
            // Checked User.js model: id is a String field. _id is Mongo's default. 
            // The seeding logic uses `_id: newId` or just `id: newId`?
            // Step 215 seed output says "Connected to DB".
            // Seed script likely used `new User(data)`. User model has `id: { type: String, required: true, unique: true }`.
            // So I should query by `id`, not `_id`. THIS IS CRITICAL.
            // Wait, Mongoose users `_id` by default. If I defined `id` field in Schema, I should use it.

            // Fetch User Details (Check both _id and id)
            const userDetail = await User.findOne({
                $or: [
                    { _id: otherUserId },
                    { id: otherUserId }
                ]
            });

            // Fetch Last Message
            const lastMessage = await Message.findOne({ matchId: match.id })
                .sort({ createdAt: -1 });

            return {
                match,
                user: userDetail,
                lastMessage
            };
        }));

        // Filter out matches where user might represent a deleted account (null user)
        const validMatches = populatedMatches.filter(m => m.user);

        res.json(validMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single match by ID
router.get('/single/:matchId', async (req, res) => {
    try {
        const match = await Match.findOne({ id: req.params.matchId }) || await Match.findById(req.params.matchId);
        if (!match) return res.status(404).json({ error: 'Match not found' });
        res.json(match);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a match
router.post('/', async (req, res) => {
    try {
        const { user1Id, user2Id } = req.body;
        const newMatch = new Match({
            id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user1Id,
            user2Id,
            createdAt: new Date(),
            unreadCount1: 0,
            unreadCount2: 0
        });
        await newMatch.save();
        res.json(newMatch);
    } catch (error) {
        res.status(500).json({ error: 'Error creating match' });
    }
});

// Update a match (e.g. enable voice call)
router.put('/:id', async (req, res) => {
    try {
        const matchId = req.params.id;
        const updates = req.body;

        // Find by custom ID first, then _id
        const updatedMatch = await Match.findOneAndUpdate(
            { id: matchId },
            { $set: updates },
            { new: true }
        );

        if (!updatedMatch) {
            const fallback = await Match.findByIdAndUpdate(matchId, updates, { new: true });
            if (!fallback) return res.status(404).json({ error: 'Match not found' });
            return res.json(fallback);
        }

        res.json(updatedMatch);
    } catch (error) {
        console.error("Error updating match:", error);
        res.status(500).json({ error: 'Error updating match' });
    }
});

// Delete a match (for blocking/unmatching)
router.delete('/:id', async (req, res) => {
    try {
        const matchId = req.params.id;

        // 1. Delete the match (Try custom ID first, then _id)
        const deletedMatch = await Match.findOneAndDelete({ id: matchId }) || await Match.findByIdAndDelete(matchId);

        if (!deletedMatch) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // 2. Delete associated messages
        await Message.deleteMany({ matchId: deletedMatch.id }); // Use the ID from the deleted match document

        res.json({ message: 'Match and conversation deleted', matchId: deletedMatch.id });
    } catch (error) {
        console.error("Error deleting match:", error);
        res.status(500).json({ error: 'Error deleting match' });
    }
});

module.exports = router;
