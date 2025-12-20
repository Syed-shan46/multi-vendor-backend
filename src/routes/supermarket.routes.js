const express = require('express');
const { addProduct, bulkUpload, getProducts } = require('../controllers/supermarket.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/product', protect, addProduct);
router.post('/bulk-upload', protect, bulkUpload);
router.get('/products/:vendorId', getProducts);

module.exports = router;
