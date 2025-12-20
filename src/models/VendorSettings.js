const mongoose = require('mongoose');

const vendorSettingsSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true
    },
    businessType: {
        type: String,
        enum: ['grocery', 'restaurant', 'supermarket'],
        required: true
    },

    // Grocery Settings
    activeCategories: [String],
    sameDayDelivery: Boolean,
    slotBasedDelivery: Boolean,
    minimumOrderValue: Number,

    // Restaurant Settings
    restaurantType: String,
    cuisines: [String],
    acceptOrders: Boolean,
    avgPreparationTime: Number, // in minutes
    packagingCharge: Number,

    // Supermarket Settings
    departments: [String],
    realTimeStock: Boolean,
    lowStockAlert: Number,
    gstBillingEnabled: Boolean,
    homeDelivery: Boolean,
    inStorePickup: Boolean,
    deliverySlots: [String] // e.g. ["10:00-12:00", "14:00-16:00"]

}, {
    timestamps: true
});

module.exports = mongoose.model('VendorSettings', vendorSettingsSchema);
