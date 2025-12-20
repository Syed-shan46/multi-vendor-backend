const RestaurantMenu = require('../models/RestaurantMenu');
const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Add Menu Item
// @route   POST /restaurant/menu
// @access  Private (Vendor)
const addUnknownMenuItem = async (req, res, next) => { // keeping generic name or specific? addMenuItem better
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor || vendor.businessType !== 'restaurant') {
            return errorResponse(res, 403, 'Access denied. Restaurant vendors only.');
        }

        const {
            itemName, category, price, vegType,
            spicyLevel, preparationTime, available
        } = req.body;

        const menuItem = await RestaurantMenu.create({
            vendorId: vendor._id,
            itemName,
            category,
            price,
            vegType,
            spicyLevel,
            preparationTime,
            available
        });

        successResponse(res, 201, 'Menu item added successfully', menuItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Menu by Vendor
// @route   GET /restaurant/menu/:vendorId
// @access  Public
const getMenu = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const menu = await RestaurantMenu.find({ vendorId });

        successResponse(res, 200, 'Menu retrieved successfully', menu);
    } catch (error) {
        next(error);
    }
};

// @desc    Update Menu Item Status
// @route   PATCH /restaurant/menu/:menuId/status
// @access  Private (Vendor)
const updateMenuStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { menuId } = req.params;
        const { available } = req.body; // Boolean

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const menuItem = await RestaurantMenu.findOne({ _id: menuId, vendorId: vendor._id });
        if (!menuItem) return errorResponse(res, 404, 'Item not found or unauthorized');

        menuItem.available = available;
        await menuItem.save();

        successResponse(res, 200, 'Menu status updated', menuItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Update Menu Item Details
// @route   PUT /restaurant/menu/:menuId
// @access  Private (Vendor)
const updateMenuItem = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { menuId } = req.params;
        const {
            itemName, category, price, vegType,
            spicyLevel, preparationTime, available
        } = req.body;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const menuItem = await RestaurantMenu.findOne({ _id: menuId, vendorId: vendor._id });
        if (!menuItem) return errorResponse(res, 404, 'Item not found or unauthorized');

        menuItem.itemName = itemName || menuItem.itemName;
        menuItem.category = category || menuItem.category;
        menuItem.price = price !== undefined ? price : menuItem.price;
        menuItem.vegType = vegType || menuItem.vegType;
        menuItem.spicyLevel = spicyLevel || menuItem.spicyLevel;
        menuItem.preparationTime = preparationTime !== undefined ? preparationTime : menuItem.preparationTime;
        menuItem.available = available !== undefined ? available : menuItem.available;

        await menuItem.save();

        successResponse(res, 200, 'Menu item updated successfully', menuItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete Menu Item
// @route   DELETE /restaurant/menu/:menuId
// @access  Private (Vendor)
const deleteMenuItem = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { menuId } = req.params;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const menuItem = await RestaurantMenu.findOneAndDelete({ _id: menuId, vendorId: vendor._id });
        if (!menuItem) return errorResponse(res, 404, 'Item not found or unauthorized');

        successResponse(res, 200, 'Menu item deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addMenuItem: addUnknownMenuItem,
    getMenu,
    updateMenuStatus,
    updateMenuItem,
    deleteMenuItem
};
