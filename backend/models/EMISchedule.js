const mongoose = require('mongoose');

const emiScheduleSchema = new mongoose.Schema({
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    installment_number: { type: Number, required: true },
    due_date: { type: Date, required: true },
    principal: { type: Number, required: true },
    interest: { type: Number, required: true },
    emi_amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Overdue'], 
        default: 'Pending' 
    },
    paid_at: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('EMISchedule', emiScheduleSchema);
