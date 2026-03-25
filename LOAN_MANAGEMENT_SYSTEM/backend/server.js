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

connectMongo();
