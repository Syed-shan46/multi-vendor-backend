const mongoose = require('mongoose');

const restaurantMenuSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    itemName: {
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
    vegType: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Egg'],
        required: true
    },
    spicyLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    preparationTime: {
        type: Number, // In minutes
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RestaurantMenu', restaurantMenuSchema);
