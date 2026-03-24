const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    installment_number: { type: Number, required: true },
    amount_paid: { type: Number, required: true },
    payment_date: { type: Date, default: Date.now },
    method: { 
        type: String, 
        enum: ['UPI', 'Card', 'Net Banking', 'Netbanking', 'Wallet', 'Cash'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Paid', 'Pending', 'Failed'], 
        default: 'Paid' 
    },
    transaction_id: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
