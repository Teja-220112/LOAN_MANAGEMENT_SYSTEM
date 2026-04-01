require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const loanRoutes = require('./routes/loans');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const bankRoutes = require('./routes/banks');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health endpoint (useful for debugging)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        server: 'ok',
        mongoState: mongoose.connection.readyState // 0=disconnected,1=connected,2=connecting,3=disconnecting
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/notifications', notificationRoutes);

// Start HTTP server immediately (do not block on MongoDB connection)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Database Connection (async) with fallback to local MongoDB
async function connectMongo() {
    const primary = process.env.MONGO_URI;
    const fallback = process.env.MONGO_URI_FALLBACK || 'mongodb://127.0.0.1:27017/loansphere';

    const connectWith = async (uri, label) => {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000
        });
        console.log(`Connected to MongoDB (${label})`);
    };

    try {
        if (!primary) throw new Error('MONGO_URI is not set');
        await connectWith(primary, 'primary');
    } catch (err) {
        console.error('Failed to connect to MongoDB (primary)', err && err.message ? err.message : err);
        try {
            await connectWith(fallback, 'fallback');
        } catch (err2) {
            console.error('Failed to connect to MongoDB (fallback)', err2 && err2.message ? err2.message : err2);
        }
    }
}

connectMongo().then(() => {
    // Run immediately on startup then every 24 hours
    scheduleEmiReminders();
    setInterval(scheduleEmiReminders, 24 * 60 * 60 * 1000);
});

async function scheduleEmiReminders() {
    try {
        const EMISchedule = require('./models/EMISchedule');
        const Notification = require('./models/Notification');
        const now = new Date();
        const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
        const in10DaysStart = new Date(in10Days.getFullYear(), in10Days.getMonth(), in10Days.getDate());
        const in10DaysEnd = new Date(in10DaysStart.getTime() + 24 * 60 * 60 * 1000);

        const dueEmis = await EMISchedule.find({
            status: 'Pending',
            due_date: { $gte: in10DaysStart, $lt: in10DaysEnd }
        }).populate('userId', 'email firstName');

        for (const emi of dueEmis) {
            const alreadySent = await Notification.findOne({
                userId: emi.userId,
                emiId: emi._id,
                type: 'emi_due'
            });
            if (!alreadySent) {
                await Notification.create({
                    userId: emi.userId,
                    type: 'emi_due',
                    title: '⏰ EMI Due in 10 Days',
                    message: `Your EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} is due on ${new Date(emi.due_date).toLocaleDateString('en-IN')}. Please ensure your account has sufficient funds.`,
                    loanId: emi.loanId,
                    emiId: emi._id
                });
                
                const { sendEmail } = require('./utils/email');
                const emailHtml = `<h3>EMI Due Reminder</h3><p>Dear ${emi.userId.firstName},</p><p>Your EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} is due on ${new Date(emi.due_date).toLocaleDateString('en-IN')}. Please ensure your account has sufficient funds.</p>`;
                await sendEmail(emi.userId.email, emi.userId.firstName, 'EMI Due in 10 Days', emailHtml);
            }
        }
        if (dueEmis.length > 0) console.log(`EMI reminders sent for ${dueEmis.length} installments`);
    } catch (err) {
        console.error('EMI reminder job error:', err.message);
    }
}
