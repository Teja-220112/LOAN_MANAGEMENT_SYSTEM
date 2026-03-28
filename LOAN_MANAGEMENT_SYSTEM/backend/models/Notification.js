const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['loan_approved', 'loan_rejected', 'emi_due', 'emi_paid', 'general'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
    emiId: { type: mongoose.Schema.Types.ObjectId, ref: 'EMISchedule' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
