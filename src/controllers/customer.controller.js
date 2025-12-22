const Category = require('../models/Category'); // Added import
const GroceryProduct = require('../models/GroceryProduct');
const RestaurantMenu = require('../models/RestaurantMenu');
const SupermarketProduct = require('../models/SupermarketProduct');
const Vendor = require('../models/Vendor');
const VendorProfile = require('../models/VendorProfile');
const VendorLocation = require('../models/VendorLocation');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get All Categories (Common)
// @route   GET /api/customer/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isCommon: true }).sort('name');

        // Map to frontend expectation if needed (icon, color)
        // Frontend expects: name, icon (string?), color (hex string?)
        // Backend stores: name, image
        // We will just return what we have.

        successResponse(res, 200, 'Categories fetched', categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Products (Mixed for Home)
// @route   GET /api/customer/products
// @access  Public
const getAllProducts = async (req, res, next) => {
    try {
        // Fetch from all collections
        // Limit/Pagination logic needed for real scale
        const groceries = await GroceryProduct.find({ stockStatus: 'In Stock' });
        const menus = await RestaurantMenu.find({ available: true });
        const supermarket = await SupermarketProduct.find({ stockStatus: 'In Stock' });

        // Normalize data for frontend
        const normalized = [
            ...groceries.map(p => ({
                id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                type: 'grocery',
                vendorId: p.vendorId,
                category: p.category
            })),
            ...menus.map(p => ({
                id: p._id,
                name: p.itemName,
                // Restaurant menu doesn't strictly enforce image yet? 
                // Wait, RestaurantMenuItem has 'itemName', not 'name'.
                image: '', // Needs image in schema if we want to show it
                price: p.price,
                type: 'restaurant',
                vendorId: p.vendorId,
                category: p.category
            })),
            ...supermarket.map(p => ({
                id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                type: 'supermarket',
                vendorId: p.vendorId,
                category: p.category
            }))
        ];

        // Shuffle or sort?
        successResponse(res, 200, 'Products fetched', normalized);
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Vendors with Profile
// @route   GET /api/customer/vendors
// @access  Public
const getAllVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.find({ status: 'approved' });

        // We need profile info (name, logo)
        // This is N+1 query problem, aggregation is better but simple loop for now
        const vendorData = [];
        for (const v of vendors) {
            const [profile, location] = await Promise.all([
                VendorProfile.findOne({ vendorId: v._id }),
                VendorLocation.findOne({ vendorId: v._id })
            ]);

            if (profile) {
                vendorData.push({
                    id: v._id,
                    businessType: v.businessType,
                    name: profile.businessName,
                    logo: profile.businessLogo,
                    description: profile.description,
                    latitude: location ? location.latitude : null,
                    longitude: location ? location.longitude : null,
                    deliveryRadius: location ? location.deliveryRadius : null,
                });
            }
        }

        successResponse(res, 200, 'Vendors fetched', vendorData);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Products for Specific Vendor
// @route   GET /api/customer/vendor/:vendorId/products
// @access  Public
const getVendorProducts = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        let products = [];
        if (vendor.businessType === 'grocery') {
            products = await GroceryProduct.find({ vendorId });
        } else if (vendor.businessType === 'restaurant') {
            products = await RestaurantMenu.find({ vendorId });
        } else {
            products = await SupermarketProduct.find({ vendorId });
        }

        const normalized = products.map(p => ({
            id: p._id,
            name: p.name || p.itemName, // Handle difference
            image: p.image, // Restaurant needs image field!
            price: p.price,
            type: vendor.businessType,
            vendorId: p.vendorId,
            category: p.category,
            description: p.description || p.vegType // extra info
        }));

        successResponse(res, 200, 'Vendor products fetched', normalized);

    } catch (error) {
        next(error);
    }
};

// @desc    Search Products
// @route   GET /api/customer/search?q=query
// @access  Public
const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return errorResponse(res, 400, 'Query required');

        const regex = new RegExp(q, 'i');

        // Simple search across all collections
        const groceries = await GroceryProduct.find({ name: regex });
        const menus = await RestaurantMenu.find({ itemName: regex });
        const supermarket = await SupermarketProduct.find({ name: regex });

        // Normalize data
        const normalized = [
            ...groceries.map(p => ({
                id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                type: 'grocery',
                vendorId: p.vendorId,
                category: p.category
            })),
            ...menus.map(p => ({
                id: p._id,
                name: p.itemName,
                image: '',
                price: p.price,
                type: 'restaurant',
                vendorId: p.vendorId,
                category: p.category
            })),
            ...supermarket.map(p => ({
                id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                type: 'supermarket',
                vendorId: p.vendorId,
                category: p.category
            }))
        ];

        successResponse(res, 200, 'Search results', normalized);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllProducts,
    getAllVendors,
    getVendorProducts,
    searchProducts,
    getAllCategories
};
