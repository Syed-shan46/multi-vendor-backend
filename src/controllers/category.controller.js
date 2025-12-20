const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const GroceryProduct = require('../models/GroceryProduct');
const RestaurantMenu = require('../models/RestaurantMenu');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Create a Category
// @route   POST /api/category
// @access  Public (for testing)
const createCategory = async (req, res, next) => {
    try {
        const { name, image, vendorId, isCommon, businessType } = req.body;

        const isCommonBool = isCommon === true || isCommon === 'true';

        if (isCommonBool) {
            // Creating a common category
            if (!businessType) {
                return errorResponse(res, 400, 'Business Type is required for common categories');
            }
            if (!['grocery', 'restaurant', 'supermarket'].includes(businessType)) {
                return errorResponse(res, 400, 'Invalid Business Type');
            }

            // Check duplicate common
            const existing = await Category.findOne({ name, isCommon: true, businessType });
            if (existing) return errorResponse(res, 400, 'Common category already exists');

            const category = await Category.create({
                name,
                image,
                isCommon: true,
                businessType,
                vendorId: null
            });
            return successResponse(res, 201, 'Common Category created', category);

        } else {
            // Creating a vendor-specific category
            let targetVendorId = vendorId;

            // Try to resolve vendor from token if id not provided
            if (!targetVendorId && req.user) {
                const vendor = await Vendor.findOne({ vendorUserId: req.user._id });
                if (vendor) targetVendorId = vendor._id;
            }

            if (!targetVendorId) return errorResponse(res, 400, 'Vendor ID is required for custom categories');

            // Resolve businessType from vendor
            const vendor = await Vendor.findById(targetVendorId);
            if (!vendor) return errorResponse(res, 404, 'Vendor not found');

            // Check duplicate for this vendor
            const existing = await Category.findOne({ name, vendorId: targetVendorId });
            if (existing) return errorResponse(res, 400, 'Category already exists for this vendor');

            const category = await Category.create({
                vendorId: targetVendorId,
                name,
                image,
                isCommon: false,
                businessType: vendor.businessType
            });
            return successResponse(res, 201, 'Category created', category);
        }
    } catch (error) {
        if (error.code === 11000) {
            return errorResponse(res, 400, 'Category already exists');
        }
        next(error);
    }
};

// @desc    Get Categories by Vendor (Includes Common)
// @route   GET /category/:vendorId
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const { vendorId } = req.params;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        // Fetch Common Categories for this business type + Vendor's own categories
        const categories = await Category.find({
            $or: [
                { vendorId: vendorId },
                { isCommon: true, businessType: vendor.businessType }
            ]
        }).sort({ isCommon: -1, name: 1 }); // Common first, then alphabetic

        successResponse(res, 200, 'Categories retrieved', categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete Category
// @route   DELETE /category/:categoryId
// @access  Public (for testing as requested)
const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        // Simple delete by ID as requested (no ownership check)
        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) return errorResponse(res, 404, 'Category not found');

        successResponse(res, 200, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    deleteCategory
};
