const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');

// GET /api/banks?purpose=education
router.get('/', async (req, res) => {
    try {
        const { purpose } = req.query;
        if (!purpose) {
            return res.status(400).json({ success: false, message: 'Purpose is required' });
        }
        const banks = await Bank.find({ purpose: purpose.toLowerCase() });
        res.json({ success: true, data: banks });
    } catch (err) {
        console.error('Error fetching banks:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Seed some initial data for banks (one-time or through API if needed)
// Added a POST /api/banks/seed for convenience
router.post('/seed', async (req, res) => {
    try {
        const banks = [
            { name: 'SBI', purpose: 'education', minRate: 8.2, maxRate: 10.5 },
            { name: 'HDFC', purpose: 'education', minRate: 8.8, maxRate: 11.5 },
            { name: 'ICICI', purpose: 'education', minRate: 9.0, maxRate: 12.0 },
            
            { name: 'SBI', purpose: 'personal', minRate: 10.5, maxRate: 14.5 },
            { name: 'HDFC', purpose: 'personal', minRate: 11.0, maxRate: 15.0 },
            { name: 'Axis Bank', purpose: 'personal', minRate: 10.2, maxRate: 13.8 },
            
            { name: 'BOI', purpose: 'business', minRate: 9.5, maxRate: 13.0 },
            { name: 'Bank of India', purpose: 'business', minRate: 9.0, maxRate: 12.5 },
            { name: 'Kotak', purpose: 'business', minRate: 10.0, maxRate: 14.0 },

            { name: 'SBI', purpose: 'home', minRate: 8.5, maxRate: 9.5 },
            { name: 'HDFC', purpose: 'home', minRate: 8.7, maxRate: 10.2 },
            { name: 'LIC Housing', purpose: 'home', minRate: 8.4, maxRate: 9.8 },

            { name: 'Mahindra Finance', purpose: 'vehicle', minRate: 9.2, maxRate: 11.5 },
            { name: 'HDFC Bank', purpose: 'vehicle', minRate: 9.5, maxRate: 12.0 },
            { name: 'Axis Bank', purpose: 'vehicle', minRate: 8.9, maxRate: 10.8 },
        ];
        
        await Bank.deleteMany({}); // Optional: clear existing
        const inserted = await Bank.insertMany(banks);
        res.json({ success: true, message: 'Seeded banks', data: inserted });
    } catch (err) {
        console.error('Error seeding banks:', err);
        res.status(500).json({ success: false, message: 'Error seeding banks' });
    }
});

module.exports = router;
