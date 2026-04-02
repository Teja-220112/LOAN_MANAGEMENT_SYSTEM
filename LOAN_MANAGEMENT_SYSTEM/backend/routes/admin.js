const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const EMISchedule = require('../models/EMISchedule');
const bcrypt = require('bcryptjs');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

// Helper: mark overdue EMIs at query time
async function updateOverdueEmis() {
    try {
        await EMISchedule.updateMany(
            { status: 'Pending', due_date: { $lt: new Date() } },
            { $set: { status: 'Overdue' } }
        );
    } catch (e) { /* silent */ }
}

router.get('/dashboard/stats', async (req, res) => {
    try {
        await updateOverdueEmis();

        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalApplications = await Loan.countDocuments({});
        const approvedLoans = await Loan.countDocuments({ status: 'Approved' });
        
        // Find defaulters (users with overdue EMIs)
        const overdueEmis = await EMISchedule.find({ status: 'Overdue' }).distinct('userId');
        const totalDefaulters = overdueEmis.length;

        // Real monthly loan application data (last 6 months)
        const now = new Date();
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const count = await Loan.countDocuments({ createdAt: { $gte: start, $lt: end } });
            monthlyData.push(count);
        }

        // Total disbursed amount
        const disbursedAgg = await Loan.aggregate([
            { $match: { status: { $in: ['Approved', 'Active'] } } },
            { $group: { _id: null, total: { $sum: '$loan_amount' } } }
        ]);
        const totalDisbursed = disbursedAgg.length > 0 ? disbursedAgg[0].total : 0;

        // Purpose breakdown
        const purposeAgg = await Loan.aggregate([
            { $group: { 
                _id: '$loan_purpose', 
                count: { $sum: 1 }, 
                avgAmount: { $avg: '$loan_amount' },
                approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } }
            } }
        ]);
        const purposeBreakdown = purposeAgg.map(p => ({
            purpose: p._id || 'General',
            count: p.count,
            share: totalApplications > 0 ? Math.round((p.count / totalApplications) * 100) : 0,
            avgAmount: Math.round(p.avgAmount || 0),
            approvalPct: p.count > 0 ? Math.round((p.approvedCount / p.count) * 100) : 0
        }));

        // Portfolio health
        const loanStats = await Loan.aggregate([
            { $match: { status: 'Approved' } },
            { $group: {
                _id: null,
                avgAmount: { $avg: '$loan_amount' },
                avgCreditScore: { $avg: '$credit_score' }
            } }
        ]);
        const portfolioHealth = {
            avgLoanAmount: loanStats.length > 0 ? Math.round(loanStats[0].avgAmount) : 0,
            avgCreditScore: loanStats.length > 0 ? Math.round(loanStats[0].avgCreditScore) : 0,
            emiCollectionRate: 98, // Placeholder
            avgProcessingTime: '2 days' // Placeholder
        };

        res.json({
            success: true,
            data: {
                totalUsers,
                totalApplications,
                approvedLoans,
                totalDefaulters,
                totalDisbursed,
                monthlyData,
                purposeBreakdown,
                portfolioHealth,
                statusDistribution: {
                    Approved: approvedLoans,
                    Pending: await Loan.countDocuments({ status: 'Pending' }),
                    Rejected: await Loan.countDocuments({ status: 'Rejected' })
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.get('/users', async (req, res) => {
    try {
        let query = { role: 'customer' };
        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        const users = await User.find(query).select('-password');
        const usersWithLoans = await Promise.all(users.map(async (u) => {
            const totalLoans = await Loan.countDocuments({ userId: u._id });
            return { ...u.toObject(), totalLoans };
        }));
        res.json({ success: true, data: usersWithLoans });
    } catch(err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, national_id, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, error: 'User already exists' });
        const user = await User.create({
            firstName, lastName, email, phone,
            password: password || 'Welcome@123',
            national_id,
            role: role || 'customer'
        });
        const userData = user.toObject();
        delete userData.password;
        res.status(201).json({ success: true, data: userData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { firstName, lastName, phone, status, kyc_verified } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (status) user.status = status;
        if (kyc_verified !== undefined) user.kyc_verified = kyc_verified;
        await user.save();
        const userData = user.toObject();
        delete userData.password;
        res.json({ success: true, data: userData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { message: 'User deleted' } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/loans', async (req, res) => {
    try {
        let query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.purpose) query.loan_purpose = req.query.purpose;
        
        const loans = await Loan.find(query).populate('userId', 'firstName lastName email');
        res.json({ success: true, data: loans });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.get('/loans/:id', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('userId', 'firstName lastName email phone national_id employment_type dob address');
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        res.json({ success: true, data: loan });
    } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/loans/:id/approve', async (req, res) => {
    try {
        if (req.user && req.user.role !== 'manager') {
            return res.status(403).json({ success: false, error: 'Only managers can approve loans' });
        }
        const loan = await Loan.findById(req.params.id).populate('userId', 'email firstName lastName');
        if(!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

        // Prevent generating duplicate EMIs if already approved
        const existingEMIs = await EMISchedule.countDocuments({ loanId: loan._id });
        if (loan.status === 'Approved' && existingEMIs > 0) {
            return res.json({ success: true, data: loan, message: 'Loan already approved' });
        }

        loan.status = 'Approved';
        loan.approved_by = req.user._id;
        loan.approved_at = Date.now();
        await loan.save();

        // Delete any stale/partial EMI schedules for this loan before creating fresh ones
        await EMISchedule.deleteMany({ loanId: loan._id });

        // EMI Computation (reducing balance method)
        const P = loan.loan_amount;
        const rateToUse = loan.selected_interest_rate || loan.interest_rate;
        const R = rateToUse / 12 / 100;
        const N = loan.loan_tenure;
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

        let balance = P;
        const today = new Date();
        const emiDocs = [];
        for (let i = 1; i <= N; i++) {
            const interest = balance * R;
            const principal = emi - interest;
            balance -= principal;

            const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());

            emiDocs.push({
                loanId: loan._id,
                userId: loan.userId,
                installment_number: i,
                due_date: dueDate,
                principal: parseFloat(principal.toFixed(2)),
                interest: parseFloat(interest.toFixed(2)),
                emi_amount: parseFloat(emi.toFixed(2)),
                balance: parseFloat((balance > 0 ? balance : 0).toFixed(2)),
                status: 'Pending'
            });
        }

        // Bulk insert all EMIs in one go (faster & atomic)
        await EMISchedule.insertMany(emiDocs);

        // ── Create loan-approved notification for user ──
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: loan.userId,
                type: 'loan_approved',
                title: '🎉 Loan Approved!',
                message: `Your loan of ₹${loan.loan_amount.toLocaleString('en-IN')} (${loan.loan_purpose}) has been approved. Your EMI schedule has been set up.`,
                loanId: loan._id
            });
        } catch(notifErr) { console.error('Notification create error:', notifErr); }

        try {
            const { sendEmail } = require('../utils/email');
            const emailHtml = `<h3>Loan Approved</h3><p>Dear ${loan.userId.firstName},</p><p>Congratulations! Your loan of ₹${loan.loan_amount.toLocaleString('en-IN')} has been approved.</p><p>Your EMI schedule has been established. You can view your dashboard for details.</p>`;
            await sendEmail(loan.userId.email, loan.userId.firstName, 'Loan Approved', emailHtml);
        } catch(mailErr) { console.error('Email error:', mailErr); }

        res.json({ success: true, data: loan });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.put('/loans/:id/reject', async (req, res) => {
    try {
        if (req.user && req.user.role !== 'manager') {
            return res.status(403).json({ success: false, error: 'Only managers can reject loans' });
        }
        const loan = await Loan.findById(req.params.id);
        if(!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        
        loan.status = 'Rejected';
        await loan.save();
        res.json({ success: true, data: loan });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/emi', async (req, res) => {
    try {
        let q = {};
        if (req.query.status) q.status = req.query.status;
        const emis = await EMISchedule.find(q).populate('userId', 'firstName lastName email').populate('loanId', 'loan_purpose');
        res.json({ success: true, data: emis });
    } catch(err) { res.status(500).json({ success: false, error: err.message }) }
});

router.get('/payments', async (req, res) => {
    try {
        let q = {};
        if (req.query.status) q.status = req.query.status;
        const payments = await Payment.find(q).populate('userId', 'firstName lastName email').populate('loanId', 'loan_purpose');
        res.json({ success: true, data: payments });
    } catch(err) { res.status(500).json({ success: false, error: err.message }) }
});

router.get('/defaulters', async (req, res) => {
    try {
        await updateOverdueEmis();
        // Aggregate users with pending/overdue EMIs
        const emis = await EMISchedule.find({ status: { $in: ['Pending', 'Overdue'] } }).populate('userId', 'firstName lastName email phone');
        
        let defaultersMap = {};
        emis.forEach(emi => {
            if (emi.due_date < new Date()) {
                const uid = emi.userId._id.toString();
                if (!defaultersMap[uid]) {
                    defaultersMap[uid] = {
                        user: emi.userId,
                        missedCount: 0,
                        totalOverdue: 0
                    };
                }
                defaultersMap[uid].missedCount++;
                defaultersMap[uid].totalOverdue += emi.emi_amount;
            }
        });

        const defaulters = Object.values(defaultersMap).map(d => {
            let riskLevel = 'Low';
            if (d.missedCount >= 2) riskLevel = 'Medium';
            if (d.missedCount >= 4) riskLevel = 'High';
            return {
                ...d.user.toObject(),
                missedEMIs: d.missedCount,
                totalOverdueAmount: d.totalOverdue,
                riskLevel
            }
        });

        res.json({ success: true, data: defaulters });
    } catch(err) { res.status(500).json({ success: false, error: err.message }) }
});

// One-time cleanup: removes duplicate EMI records keeping only the correct set per loan
router.post('/cleanup-duplicate-emis', async (req, res) => {
    try {
        // Get all unique loan IDs that have EMI schedules
        const loanIds = await EMISchedule.distinct('loanId');
        let cleaned = 0;

        for (const loanId of loanIds) {
            const loan = await Loan.findById(loanId);
            if (!loan) continue;

            const expectedCount = loan.loan_tenure;
            const totalEMIs = await EMISchedule.countDocuments({ loanId });

            // If there are more EMIs than the tenure, duplicates exist
            if (totalEMIs > expectedCount) {
                // Delete all EMIs for this loan
                await EMISchedule.deleteMany({ loanId });

                // Recreate correct set
                const P = loan.loan_amount;
                const rateToUse = loan.selected_interest_rate || loan.interest_rate;
                const R = rateToUse / 12 / 100;
                const N = loan.loan_tenure;
                const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

                let balance = P;
                const today = loan.approved_at ? new Date(loan.approved_at) : new Date();
                const emiDocs = [];
                for (let i = 1; i <= N; i++) {
                    const interest = balance * R;
                    const principal = emi - interest;
                    balance -= principal;
                    const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
                    emiDocs.push({
                        loanId: loan._id,
                        userId: loan.userId,
                        installment_number: i,
                        due_date: dueDate,
                        principal: parseFloat(principal.toFixed(2)),
                        interest: parseFloat(interest.toFixed(2)),
                        emi_amount: parseFloat(emi.toFixed(2)),
                        balance: parseFloat((balance > 0 ? balance : 0).toFixed(2)),
                        status: 'Pending'
                    });
                }
                await EMISchedule.insertMany(emiDocs);
                cleaned++;
            }
        }

        res.json({ success: true, data: { message: `Cleaned ${cleaned} loan(s) with duplicate EMIs` } });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
