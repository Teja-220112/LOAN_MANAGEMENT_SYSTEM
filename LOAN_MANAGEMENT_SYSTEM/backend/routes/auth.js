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

        try {
            const { sendEmail } = require('../utils/email');
            const emailHtml = `<h3>Welcome to LoanSphere!</h3>
                <p>Dear ${firstName},</p>
                <p>Your account has been successfully created. You can now log in to manage your loan applications and installments.</p>
                <p>To verify your email and securely access your account, you will receive an OTP during your login sessions.</p>`;
            await sendEmail(email, firstName, 'Welcome to LoanSphere - Registration Successful', emailHtml);
        } catch (mailErr) {
            console.error('Registration email error:', mailErr);
        }

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

        // Hardcode manager login and auto-create if not exists
        if (email === 'manager@loansphere.com' && password === 'manager123') {
            let managerUser = await User.findOne({ email });
            if (!managerUser) {
                managerUser = await User.create({
                    firstName: 'System',
                    lastName: 'Manager',
                    email: email,
                    password: password,
                    role: 'manager',
                    status: 'Active'
                });
            }
            return res.json({
                success: true,
                data: {
                    user: {
                        id: managerUser._id,
                        name: `${managerUser.firstName} ${managerUser.lastName}`,
                        email: managerUser.email,
                        role: managerUser.role
                    },
                    token: generateToken(managerUser._id)
                }
            });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.status !== 'Active') {
                return res.status(403).json({ success: false, error: `Account is ${user.status}` });
            }
            if (user.role === 'admin' || user.role === 'manager') {
                return res.json({
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
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await user.save();

            // Send OTP via Email
            const { sendEmail } = require('../utils/email');
            const emailHtml = `<h3>Your Login OTP</h3><p>Dear ${user.firstName},</p><p>Your verification code for LoanSphere is <b>${otp}</b>. It will expire in 10 minutes.</p>`;
            await sendEmail(user.email, user.firstName, 'LoanSphere Verification OTP', emailHtml);

            return res.json({
                success: true,
                requiresOtp: true,
                userId: user._id,
                message: 'OTP sent to your email'
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);
        
        if (!user || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
        }
        
        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error verifying OTP' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
});

module.exports = router;
