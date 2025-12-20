const GroceryProduct = require('../models/GroceryProduct');
const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Add Grocery Product
// @route   POST /grocery/product
// @access  Private (Vendor)
const addProduct = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor || vendor.businessType !== 'grocery') {
            return errorResponse(res, 403, 'Access denied. Grocery vendors only.');
        }

        const { name, category, price, quantity, stockStatus, image } = req.body;

        const product = await GroceryProduct.create({
            vendorId: vendor._id,
            name,
            category,
            price,
            quantity,
            stockStatus,
            image
        });

        successResponse(res, 201, 'Product added successfully', product);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Grocery Products by Vendor
// @route   GET /grocery/products/:vendorId
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const products = await GroceryProduct.find({ vendorId });

        successResponse(res, 200, 'Grocery products retrieved', products);
    } catch (error) {
        next(error);
    }
};

// @desc    Update Grocery Product Status
// @route   PATCH /grocery/product/:productId/status
// @access  Private (Vendor)
const updateProductStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { stockStatus } = req.body; // Expect "In Stock" or "Out of Stock"

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const product = await GroceryProduct.findOne({ _id: productId, vendorId: vendor._id });
        if (!product) return errorResponse(res, 404, 'Product not found or unauthorized');

        product.stockStatus = stockStatus;
        await product.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('product_status_updated', {
                productId: product._id,
                stockStatus: product.stockStatus,
                vendorId: product.vendorId
            });
        }

        successResponse(res, 200, 'Product status updated', product);
    } catch (error) {
        next(error);
    }
};

// @desc    Update Grocery Product Details
// @route   PUT /grocery/product/:productId
// @access  Private (Vendor)
const updateProduct = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { name, category, price, quantity, stockStatus, image } = req.body;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const product = await GroceryProduct.findOne({ _id: productId, vendorId: vendor._id });
        if (!product) return errorResponse(res, 404, 'Product not found or unauthorized');

        product.name = name || product.name;
        product.category = category || product.category;
        product.price = price !== undefined ? price : product.price;
        product.quantity = quantity || product.quantity;
        product.stockStatus = stockStatus || product.stockStatus;
        product.image = image || product.image;

        await product.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('product_updated', {
                productId: product._id,
                data: product
            });
            // Also emit status specific if it changed
            io.emit('product_status_updated', {
                productId: product._id,
                stockStatus: product.stockStatus,
                vendorId: product.vendorId
            });
        }

        successResponse(res, 200, 'Product updated successfully', product);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete Grocery Product
// @route   DELETE /grocery/product/:productId
// @access  Private (Vendor)
const deleteProduct = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const product = await GroceryProduct.findOneAndDelete({ _id: productId, vendorId: vendor._id });
        if (!product) return errorResponse(res, 404, 'Product not found or unauthorized');

        successResponse(res, 200, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addProduct,
    getProducts,
    updateProductStatus,
    updateProduct,
    deleteProduct
};
