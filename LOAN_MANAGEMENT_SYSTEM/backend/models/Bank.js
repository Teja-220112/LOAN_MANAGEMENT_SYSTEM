const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: { type: String, required: true },
    purpose: { type: String, enum: ['education', 'personal', 'business', 'home', 'vehicle'], required: true },
    minRate: { type: Number, required: true },
    maxRate: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bank', bankSchema);
