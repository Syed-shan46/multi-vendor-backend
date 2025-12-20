const express = require('express');
const {
    getAllProducts,
    getAllVendors,
    getVendorProducts,
    searchProducts,
    getAllCategories
} = require('../controllers/customer.controller');
// We might not need protection for browsing
// const { protectUser } = require('../middlewares/userAuth.middleware'); 

const router = express.Router();

router.get('/categories', getAllCategories);
router.get('/products', getAllProducts);
router.get('/vendors', getAllVendors);
router.get('/vendor/:vendorId/products', getVendorProducts);
router.get('/search', searchProducts);

module.exports = router;
