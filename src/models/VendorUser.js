const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorUserSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        default: 'New User' // Default name for OTP registered users
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true // For Firebase auth compatibility
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
        // Password is now OPTIONAL for OTP based users
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true // Optional, only for Firebase authenticated users
    },
    role: {
        type: String,
        enum: ['vendor', 'admin', 'user'],
        default: 'user' // Default to 'user' for quick OTP signup
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
vendorUserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user password to hashed password in database
vendorUserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('VendorUser', vendorUserSchema);
