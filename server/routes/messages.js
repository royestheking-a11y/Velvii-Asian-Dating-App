const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a match
router.get('/:matchId', async (req, res) => {
    try {
        const messages = await Message.find({ matchId: req.params.matchId }).sort({ createdAt: 1 }).lean();

        // Manual transform to ensure IDs properly exist
        const safeMessages = messages.map(msg => ({
            ...msg,
            id: msg.id || (msg._id ? msg._id.toString() : null)
        }));

        console.log(`[API] Serving ${safeMessages.length} messages for match ${req.params.matchId} (v2)`);
        res.json({ messages: safeMessages, v: 2 });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// Send a message
router.post('/', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();

        // Convert to object and manually ensure ID exists to avoid transform issues
        const safeMessage = {
            ...newMessage.toObject(),
            id: newMessage.id || newMessage._id.toString()
        };
        // Clean up _id/v if specific format needed, but safest is to keep everything or just ensure id
        if (!safeMessage.id && safeMessage._id) safeMessage.id = safeMessage._id.toString();
        // Remove _id if we want to mimic transform, but keeping it is safer for debugging. 
        // Let's just normalize.
        delete safeMessage._id;
        delete safeMessage.__v;

        console.log('[API] Sent message created with ID:', safeMessage.id);
        res.status(201).json(safeMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});

// Mark as read
router.post('/:matchId/read', async (req, res) => {
    try {
        const { userId } = req.body; // User who is "reading"
        await Message.updateMany(
            { matchId: req.params.matchId, receiverId: userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error marking messages as read' });
    }
});

// Update a message (e.g. for call status updates)
router.put('/:id', async (req, res) => {
    try {
        const updatedMessage = await Message.findOneAndUpdate(
            { id: req.params.id }, // Use custom 'id' field, not _id
            { $set: req.body },
            { new: true }
        );

        if (!updatedMessage) {
            // Fallback to _id if id not found (though app uses string ids)
            const fallback = await Message.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );
            if (!fallback) return res.status(404).json({ error: 'Message not found' });
            return res.json(fallback);
        }

        res.json(updatedMessage);
    } catch (error) {
        console.error("Update message error:", error);
        res.status(500).json({ error: 'Error updating message' });
    }
});

// Delete a message
router.delete('/:id', async (req, res) => {
    try {
        // Try to find by custom 'id' field first
        let message = await Message.findOne({ id: req.params.id });

        // If not found, try MongoDB _id
        if (!message) {
            try {
                message = await Message.findById(req.params.id);
            } catch (e) {
                // Invalid ObjectId format, that's okay
            }
        }

        if (!message) {
            console.log('[DELETE] Message not found for id:', req.params.id);
            return res.status(404).json({ error: 'Message not found' });
        }

        console.log('[DELETE] Found message:', message._id, 'type:', message.type);

        // Soft Delete Logic
        message.isDeleted = true;

        // Clear content based on type
        if (message.type === 'image') {
            message.content = '';
        } else {
            message.content = 'This message was deleted';
        }

        await message.save();
        console.log('[DELETE] Message deleted successfully');
        res.json(message);
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ error: 'Error deleting message' });
    }
});

module.exports = router;
