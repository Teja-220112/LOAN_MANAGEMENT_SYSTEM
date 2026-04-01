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

        // ── Notification: EMI Paid ──
        try {
            const Notification = require('../models/Notification');
            const loan = await Loan.findById(emi.loanId);
            const isPrepaid = emi.due_date > new Date();
            await Notification.create({
                userId: req.user._id,
                type: 'emi_paid',
                title: isPrepaid ? '✅ EMI Pre-paid Successfully!' : '✅ EMI Payment Successful!',
                message: isPrepaid
                    ? `You pre-paid EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} (due ${new Date(emi.due_date).toLocaleDateString('en-IN')}) ahead of schedule. Great financial discipline!`
                    : `EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} has been paid successfully via ${method || 'online'}.`,
                loanId: emi.loanId,
                emiId: emi._id
            });
            
            const { sendEmail } = require('../utils/email');
            const user = await require('../models/User').findById(req.user._id);
            const emailHtml = `<h3>${isPrepaid ? 'EMI Pre-Paid Successfully!' : 'EMI Payment Successful!'}</h3><p>Dear ${user.firstName},</p><p>Your EMI #${emi.installment_number} payment of ₹${emi.emi_amount.toLocaleString('en-IN')} was successful.</p>`;
            await sendEmail(user.email, user.firstName, 'EMI Payment Successful', emailHtml);
        } catch(notifErr) { console.error('Notification error:', notifErr); }

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

        // ── Notification: EMI Paid (Mock Route) ──
        try {
            const Notification = require('../models/Notification');
            const isPrepaid = emi.due_date > new Date();
            await Notification.create({
                userId: req.user._id,
                type: 'emi_paid',
                title: isPrepaid ? '✅ EMI Pre-paid Successfully!' : '✅ EMI Payment Successful!',
                message: isPrepaid
                    ? `You pre-paid EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} (due ${new Date(emi.due_date).toLocaleDateString('en-IN')}) ahead of schedule. Great financial discipline!`
                    : `EMI #${emi.installment_number} of ₹${emi.emi_amount.toLocaleString('en-IN')} has been paid successfully via ${method || 'online'}.`,
                loanId: emi.loanId,
                emiId: emi._id
            });
            
            const { sendEmail } = require('../utils/email');
            const user = await require('../models/User').findById(req.user._id);
            const emailHtml = `<h3>${isPrepaid ? 'EMI Pre-Paid Successfully!' : 'EMI Payment Successful!'}</h3><p>Dear ${user.firstName},</p><p>Your EMI #${emi.installment_number} payment of ₹${emi.emi_amount.toLocaleString('en-IN')} was successful.</p>`;
            await sendEmail(user.email, user.firstName, 'EMI Payment Successful', emailHtml);
        } catch(notifErr) { console.error('Notification error:', notifErr); }

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

// Get active loans with unpaid EMIs for payment page (supports pre-payment + multiple loans)
router.get('/next-due', protect, async (req, res) => {
    try {
        // Step 1: Find all approved loans for this user
        const activeLoans = await Loan.find({
            userId: req.user._id,
            status: 'Approved'
        });

        if (!activeLoans || activeLoans.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const results = [];

        for (const loan of activeLoans) {
            // Step 2: Find all EMIs for this loan (any status)
            const allEmis = await EMISchedule.find({ loanId: loan._id }).sort({ due_date: 1 });
            
            if (!allEmis || allEmis.length === 0) continue;

            // Step 3: Check if loan is fully paid
            const unpaidEmis = allEmis.filter(e => e.status !== 'Paid');
            if (unpaidEmis.length === 0) continue; // This loan is fully paid, skip it

            // Step 4: Pick the best EMI to show:
            // Priority: Overdue > Pending (by due_date) — allows pre-payment of any unpaid EMI
            const overdueEmi = unpaidEmis.find(e => e.status === 'Overdue');
            const nextEmi = overdueEmi || unpaidEmis[0]; // earliest unpaid installment

            const paidCount = allEmis.filter(e => e.status === 'Paid').length;
            const outstanding = unpaidEmis.reduce((acc, e) => acc + e.emi_amount, 0);

            results.push({
                emi: { ...nextEmi.toObject(), loanId: loan }, // Manually attach full loan object
                loanSummary: {
                    loanId: loan._id,
                    loanPurpose: loan.loan_purpose,
                    loanAmount: loan.loan_amount,
                    interestRate: loan.selected_interest_rate || loan.interest_rate,
                    tenure: loan.loan_tenure,
                    paidCount,
                    outstanding
                }
            });
        }

        res.json({ success: true, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
