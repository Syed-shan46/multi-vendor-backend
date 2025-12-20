const Vendor = require('../models/Vendor');
const VendorSettings = require('../models/VendorSettings');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Create/Update Vendor Settings
// @route   POST /vendor/settings
// @access  Private (Vendor)
const updateSettings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found');
        }

        const {
            activeCategories, sameDayDelivery, slotBasedDelivery, minimumOrderValue, // Grocery
            restaurantType, cuisines, acceptOrders, avgPreparationTime, packagingCharge, // Restaurant
            departments, realTimeStock, lowStockAlert, gstBillingEnabled, homeDelivery, inStorePickup, deliverySlots // Supermarket
        } = req.body;

        let settings = await VendorSettings.findOne({ vendorId: vendor._id });

        if (settings) {
            // Update fields based on provided body
            Object.assign(settings, req.body);
            await settings.save();
        } else {
            settings = await VendorSettings.create({
                vendorId: vendor._id,
                businessType: vendor.businessType,
                ...req.body
            });
        }

        successResponse(res, 200, 'Vendor settings saved', settings);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateSettings
};
