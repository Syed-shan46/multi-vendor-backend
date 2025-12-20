const mongoose = require('mongoose');

const supermarketProductSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    barcode: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SupermarketProduct', supermarketProductSchema);
