const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const EMISchedule = require('../models/EMISchedule');
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

router.post('/pay', protect, async (req, res) => {
    try {
        const { emiScheduleId, method, amount } = req.body;

        const emi = await EMISchedule.findOne({ _id: emiScheduleId, userId: req.user._id });
        
        if (!emi) {
            return res.status(404).json({ success: false, error: 'EMI record not found' });
        }
        if (emi.status === 'Paid') {
            return res.status(400).json({ success: false, error: 'EMI is already paid' });
        }
        
        // Mocking payment
        const payment = await Payment.create({
            loanId: emi.loanId,
            userId: req.user._id,
            installment_number: emi.installment_number,
            amount_paid: amount || emi.emi_amount,
            method,
            status: 'Paid',
            transaction_id: 'TXN' + Math.floor(Math.random() * 1000000000)
        });

        emi.status = 'Paid';
        emi.paid_at = Date.now();
        await emi.save();

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error processing payment' });
    }
});

router.get('/history', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id }).sort({ payment_date: -1 }).populate('loanId', 'loan_purpose loan_amount');
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching payments' });
    }
});

router.get('/summary', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id });
        
        const paidCount = payments.filter(p => p.status === 'Paid').length;
        const pendingCount = payments.filter(p => p.status === 'Pending').length;
        const failedCount = payments.filter(p => p.status === 'Failed').length;

        res.json({ success: true, data: { paidCount, pendingCount, failedCount } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching payment summary' });
    }
});

module.exports = router;
