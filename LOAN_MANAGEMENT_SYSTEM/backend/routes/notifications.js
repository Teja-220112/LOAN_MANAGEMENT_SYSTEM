const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications — get all notifications for logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/mark-all-read — mark all notifications as read
router.patch('/mark-all-read', protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
});

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});

module.exports = router;
