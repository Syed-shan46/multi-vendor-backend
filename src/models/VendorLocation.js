const mongoose = require('mongoose');

const vendorLocationSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    pincode: {
        type: String,
        required: [true, 'Please add a pincode']
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    openingTime: {
        type: String, // Format HH:mm
        required: true
    },
    closingTime: {
        type: String, // Format HH:mm
        required: true
    },
    deliveryRadius: {
        type: Number, // In km
        required: true
    },
    selfPickup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VendorLocation', vendorLocationSchema);
