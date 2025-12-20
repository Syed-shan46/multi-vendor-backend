const express = require('express');
const { addProduct, getProducts, updateProductStatus, updateProduct, deleteProduct } = require('../controllers/grocery.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/product', protect, addProduct);
router.patch('/product/:productId/status', protect, updateProductStatus);
router.put('/product/:productId', protect, updateProduct);
router.delete('/product/:productId', protect, deleteProduct);
router.get('/products/:vendorId', getProducts);

module.exports = router;
