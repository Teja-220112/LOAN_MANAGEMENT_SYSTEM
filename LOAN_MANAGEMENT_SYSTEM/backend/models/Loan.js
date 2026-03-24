const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loan_amount: { type: Number, required: true },
    loan_purpose: { type: String, required: true },
    monthly_income: { type: Number },
    employment_type: { type: String },
    credit_score: { type: Number },
    loan_tenure: { type: Number, required: true }, // in months
    interest_rate: { type: Number, default: 10.5 },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'], 
        default: 'Pending' 
    },
    notes: { type: String },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved_at: { type: Date },
    document_url: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
