const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Loan = require('../models/Loan');
const EMISchedule = require('../models/EMISchedule');
const { protect } = require('../middleware/auth');

// Setup array of storage engines
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/apply', protect, upload.single('document'), async (req, res) => {
    try {
        const { loan_amount, loan_purpose, loan_tenure, monthly_income, employment_type } = req.body;
        
        let document_url = null;
        if (req.file) {
            document_url = `/uploads/${req.file.filename}`;
        }

        const loan = await Loan.create({
            userId: req.user._id,
            loan_amount,
            loan_purpose,
            loan_tenure,
            monthly_income,
            employment_type,
            document_url,
            status: 'Pending'
        });

        res.status(201).json({ success: true, data: loan });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error during loan application' });
    }
});

router.get('/my-loans', protect, async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching loans' });
    }
});

router.get('/stats', protect, async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user._id });
        const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Approved').length;
        const pendingLoans = loans.filter(l => l.status === 'Pending').length;

        const emis = await EMISchedule.find({ userId: req.user._id });
        const emisPaid = emis.filter(e => e.status === 'Paid').length;
        
        let nextEmiDate = null;
        let nextEmiAmount = 0;
        
        const pendingEmis = emis.filter(e => e.status === 'Pending').sort((a,b) => a.due_date - b.due_date);
        if (pendingEmis.length > 0) {
            nextEmiDate = pendingEmis[0].due_date;
            nextEmiAmount = pendingEmis[0].emi_amount;
        }

        res.json({
            success: true,
            data: { activeLoans, pending: pendingLoans, emisPaid, nextEmiDate, nextEmiAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching stats' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        res.json({ success: true, data: loan });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching loan' });
    }
});

router.get('/:id/emi-schedule', protect, async (req, res) => {
    try {
        const schedules = await EMISchedule.find({ loanId: req.params.id, userId: req.user._id }).sort({ installment_number: 1 });
        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error fetching EMI schedule' });
    }
});

module.exports = router;
