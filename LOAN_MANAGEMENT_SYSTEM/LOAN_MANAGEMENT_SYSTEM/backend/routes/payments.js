const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const EMISchedule = require('../models/EMISchedule');
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Razorpay config (optional, only if keys exist)
let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const Razorpay = require('razorpay');
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
} catch (e) { /* razorpay not installed */ }

// Get Razorpay Key (Public)
router.get('/key', (req, res) => {
    res.json({ success: true, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock' });
});

// Create Razorpay Order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, emiScheduleId } = req.body;
        if (!razorpay) {
            return res.status(200).json({ success: true, data: { orderId: 'mock_order_' + Date.now(), amount, currency: 'INR' } });
        }
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            receipt: `emi_${emiScheduleId}`,
        });
        res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Verify Razorpay Payment & Record it
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, emiScheduleId, method } = req.body;

        // Verify signature only if razorpay is configured
        if (razorpay && razorpay_signature) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
            if (expectedSig !== razorpay_signature) {
                return res.status(400).json({ success: false, error: 'Payment verification failed' });
            }
        }

        const emi = await EMISchedule.findOne({ _id: emiScheduleId, userId: req.user._id });
        if (!emi) return res.status(404).json({ success: false, error: 'EMI record not found' });
        if (emi.status === 'Paid') return res.status(400).json({ success: false, error: 'EMI already paid' });

        const payment = await Payment.create({
            loanId: emi.loanId,
            userId: req.user._id,
            installment_number: emi.installment_number,
            amount_paid: emi.emi_amount,
            method: method || 'UPI',
            status: 'Paid',
            transaction_id: razorpay_payment_id || ('TXN' + Math.floor(Math.random() * 1000000000))
        });

        emi.status = 'Paid';
        emi.paid_at = Date.now();
        await emi.save();

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error verifying payment' });
    }
});

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

// Get next due EMI for payment page
router.get('/next-due', protect, async (req, res) => {
    try {
        // Find the oldest pending or overdue EMI across all active loans for this user
        const emi = await EMISchedule.findOne({ 
            userId: req.user._id, 
            status: { $in: ['Pending', 'Overdue'] } 
        })
        .sort({ due_date: 1 })
        .populate('loanId');

        if (!emi) {
            return res.json({ success: true, data: null });
        }

        // Get total stats for the loan summary on pay page
        const loan = emi.loanId;
        const allEmis = await EMISchedule.find({ loanId: loan._id });
        const paidEmis = allEmis.filter(e => e.status === 'Paid');
        const totalPaidCount = paidEmis.length;
        const outstanding = allEmis.filter(e => e.status !== 'Paid').reduce((acc, e) => acc + e.emi_amount, 0);

        res.json({ 
            success: true, 
            data: { 
                emi,
                loanSummary: {
                    loanId: loan._id,
                    loanAmount: loan.loan_amount,
                    interestRate: loan.interest_rate,
                    tenure: loan.loan_tenure,
                    paidCount: totalPaidCount,
                    outstanding: outstanding
                }
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
