const express = require('express');
const { createOrder, updateOrderStatus, getVendorOrders, getCustomerOrders } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', createOrder); // Public/Mock-User access
router.get('/vendor', protect, getVendorOrders); // Get My Orders
router.get('/customer/:userId', getCustomerOrders); // Get Customer Orders by ID
router.patch('/:id/status', protect, updateOrderStatus); // Vendor only

module.exports = router;
