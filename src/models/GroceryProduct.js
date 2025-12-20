const mongoose = require('mongoose');

const groceryProductSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: String, // e.g., "1kg", "500g", "1L"
        required: true
    },
    stockStatus: {
        type: String, // "In Stock", "Out of Stock"
        enum: ['In Stock', 'Out of Stock'],
        default: 'In Stock'
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GroceryProduct', groceryProductSchema);
