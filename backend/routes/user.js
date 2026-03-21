const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.put('/profile/update', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.employment_type = req.body.employment_type || user.employment_type;
            
            if (req.body.dob) user.dob = req.body.dob;

            const updatedUser = await user.save();
            res.json({
                success: true,
                data: {
                    id: updatedUser._id,
                    name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.put('/profile/change-password', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { currentPassword, newPassword } = req.body;

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // Pre-save hook will hash it
            await user.save();
            res.json({ success: true, data: { message: 'Password updated successfully' } });
        } else {
            res.status(401).json({ success: false, error: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.delete('/delete', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ success: true, data: { message: 'User removed' } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
