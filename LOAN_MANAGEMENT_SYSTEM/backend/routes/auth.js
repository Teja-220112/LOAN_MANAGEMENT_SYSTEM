const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, national_id } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            national_id,
            role: 'customer'
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.status !== 'Active') {
                return res.status(403).json({ success: false, error: `Account is ${user.status}` });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        role: user.role
                    },
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
});

module.exports = router;
