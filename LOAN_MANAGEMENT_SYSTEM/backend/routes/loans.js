const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Loan = require('../models/Loan');
const EMISchedule = require('../models/EMISchedule');
const { protect } = require('../middleware/auth');

// Setup MemoryStorage
const storage = multer.memoryStorage();
const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const upload = multer({
    storage: storage,
    limits: { files: MAX_FILES, fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(null, true);
        return cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
});

router.post('/apply', protect, upload.array('documents', MAX_FILES), async (req, res) => {
    try {
        const { 
            loan_amount, loan_purpose, loan_tenure, monthly_income, 
            employment_type, credit_score, selected_bank, selected_interest_rate 
        } = req.body;

        const docs = req.files || [];
        const document_urls = docs.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
        const document_url = document_urls.length > 0 ? document_urls[0] : null;

        const loan = await Loan.create({
            userId: req.user._id,
            loan_amount,
            loan_purpose,
            loan_tenure,
            monthly_income,
            employment_type,
            credit_score,
            document_url,
            document_urls,
            selected_bank,
            selected_interest_rate,
            status: 'Pending'
        });

        res.status(201).json({ success: true, data: loan });
    } catch (error) {
        // Multer errors (like invalid file type / too many files) surface here as well
        res.status(400).json({ success: false, error: error.message || 'Server error during loan application' });
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
