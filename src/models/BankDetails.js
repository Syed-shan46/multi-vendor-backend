const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifsc: {
        type: String,
        required: true
    },
    upiId: {
        type: String
    },
    commissionPercent: {
        type: Number,
        required: true // Admin should set this logic or user accepts it
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BankDetails', bankDetailsSchema);
