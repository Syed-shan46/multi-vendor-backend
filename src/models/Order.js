const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'User', // Assuming a User model exists for customers, but user didn't request User model creation. I will keep it as ObjectId.
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        enum: ['grocery', 'restaurant', 'supermarket'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    cancellationReason: {
        type: String
    },
    userNote: {
        type: String,
        default: ''
    },
    deliveryAddress: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
