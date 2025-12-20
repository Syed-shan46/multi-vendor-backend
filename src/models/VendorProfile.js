const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: [true, 'Please add a business name']
    },
    businessLogo: {
        type: String // URL to image
    },
    gstNumber: {
        type: String
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
