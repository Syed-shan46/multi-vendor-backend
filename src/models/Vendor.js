const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorUser',
        required: true,
        unique: true
    },
    businessType: {
        type: String,
        enum: ['grocery', 'restaurant', 'supermarket'],
        required: [true, 'Please select a business type']
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);
