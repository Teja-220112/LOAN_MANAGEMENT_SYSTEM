const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'manager'], default: 'customer' },
    dob: { type: Date },
    address: { type: String },
    national_id: { type: String },
    employment_type: { type: String },
    kyc_verified: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
