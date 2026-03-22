const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const EMISchedule = require('../models/EMISchedule');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalApplications = await Loan.countDocuments({});
        const approvedLoans = await Loan.countDocuments({ status: 'Approved' });
        
        // Find defaulters (users with overdue EMIs)
       const overdueEmis = await EMISchedule.find({ status: 'Overdue' }).distinct('userId');
       const totalDefaulters = overdueEmis.length;

       res.json({
           success: true,
           data: {
               totalUsers,
               totalApplications,
               approvedLoans,
               totalDefaulters,
               monthlyData: [10, 20, 15, 30, 45, 60], // Mock Data
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
        res.json({ success: true, data: users });
    } catch(err) {
        res.status(500).json({ success: false, error: 'Server Error' });
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
        const loan = await Loan.findById(req.params.id);
        if(!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        
        loan.status = 'Approved';
        loan.approved_by = req.user._id;
        loan.approved_at = Date.now();
        await loan.save();

        // EMI Computation
        const P = loan.loan_amount;
        const interestRate = loan.interest_rate || 10.5;
        const R = interestRate / 12 / 100;
        const N = loan.loan_tenure || 12;
        let emi = 0;
        if (R > 0) {
            emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        } else {
            emi = P / N;
        }
        
        let balance = P;
        let today = new Date();
        for (let i = 1; i <= N; i++) {
            let interest = balance * R;
            let principal = emi - interest;
            balance -= principal;
            
            let dueDate = new Date();
            dueDate.setMonth(today.getMonth() + i);
            
            await EMISchedule.create({
                loanId: loan._id,
                userId: loan.userId,
                installment_number: i,
                due_date: dueDate,
                principal: principal,
                interest: interest,
                emi_amount: emi,
                balance: balance > 0 ? balance : 0,
                status: 'Pending'
            });
        }

        res.json({ success: true, data: loan });
    } catch(err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.put('/loans/:id/reject', async (req, res) => {
    try {
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

module.exports = router;
