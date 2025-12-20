const SupermarketProduct = require('../models/SupermarketProduct');
const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Add Supermarket Product
// @route   POST /supermarket/product
// @access  Private (Vendor)
const addProduct = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor || vendor.businessType !== 'supermarket') {
            return errorResponse(res, 403, 'Access denied. Supermarket vendors only.');
        }

        const { name, department, brand, price, mrp, stock, barcode } = req.body;

        const product = await SupermarketProduct.create({
            vendorId: vendor._id,
            name,
            department,
            brand,
            price,
            mrp,
            stock,
            barcode
        });

        successResponse(res, 201, 'Product added successfully', product);
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk Upload Supermarket Products
// @route   POST /supermarket/bulk-upload
// @access  Private (Vendor)
const bulkUpload = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor || vendor.businessType !== 'supermarket') {
            return errorResponse(res, 403, 'Access denied. Supermarket vendors only.');
        }

        const products = req.body; // Expecting an array of products

        if (!Array.isArray(products) || products.length === 0) {
            return errorResponse(res, 400, 'Please provide an array of products');
        }

        const productsWithVendor = products.map(p => ({ ...p, vendorId: vendor._id }));

        const result = await SupermarketProduct.insertMany(productsWithVendor);

        successResponse(res, 201, `${result.length} products uploaded successfully`, result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Supermarket Products by Vendor
// @route   GET /supermarket/products/:vendorId
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const products = await SupermarketProduct.find({ vendorId });

        successResponse(res, 200, 'Supermarket products retrieved', products);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addProduct,
    bulkUpload,
    getProducts
};
