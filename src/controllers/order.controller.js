const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const GroceryProduct = require('../models/GroceryProduct');
const SupermarketProduct = require('../models/SupermarketProduct');
const RestaurantMenu = require('../models/RestaurantMenu');
const User = require('../models/User'); // Import User for notifications
const sendPushNotification = require('../utils/pushNotification');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Create Order
// @route   POST /order/create
// @access  Private (User logic assumed, but using generic protect for now. Or Public?)
// Prompt says: "Create Order model: - userId"
// It implies a user is logged in. I will use `protect` assuming Users also use the same Auth system or just pass userId in body for now if "User" model not built.
// Since User model wasn't asked, I'll assume the caller passes a userId or is a logged-in VendorUser acting as customer (unlikely).
// "ORDER FLOW (COMMON)" -> "Create Order model: userId".
// I'll assume generic access for now but strictly validate fields.
// Actually, usually customers are separate entities. Maybe I should allow passing userId in body for testing purposes since Customer Auth isn't built.

const createOrder = async (req, res, next) => {
    try {
        const {
            userId, items, orderType, userNote,
            deliveryAddress, latitude, longitude,
            appliedCoupon, discountAmount
        } = req.body;
        // items: [{ productId, name, quantity, price, vendorId (optional) }]

        // 1. Group items by Vendor
        const ordersByVendor = {}; // { vendorId: { items: [], totalAmount: 0 } }

        for (const item of items) {
            let itemVendorId = item.vendorId;

            // If vendorId is not provided in the item, look it up (Fallback)
            if (!itemVendorId) {
                let product = await GroceryProduct.findById(item.productId);
                if (!product) product = await RestaurantMenu.findById(item.productId);
                if (!product) product = await SupermarketProduct.findById(item.productId);

                if (product) {
                    itemVendorId = product.vendorId.toString();
                } else {
                    if (req.body.vendorId) {
                        itemVendorId = req.body.vendorId;
                    } else {
                        continue;
                    }
                }
            }

            if (!ordersByVendor[itemVendorId]) {
                ordersByVendor[itemVendorId] = {
                    items: [],
                    totalAmount: 0,
                    vendorId: itemVendorId
                };
            }

            ordersByVendor[itemVendorId].items.push(item);
            ordersByVendor[itemVendorId].totalAmount += (item.price * item.quantity);
        }

        const createdOrders = [];
        const io = req.app.get('io');

        // 2. Create an Order for each Vendor Group
        for (const vId in ordersByVendor) {
            const vendorGroup = ordersByVendor[vId];

            const vendor = await Vendor.findById(vId);
            if (!vendor) continue;

            const newOrder = await Order.create({
                userId,
                vendorId: vId,
                items: vendorGroup.items,
                totalAmount: vendorGroup.totalAmount,
                orderType,
                status: 'Pending',
                userNote: userNote || '',
                deliveryAddress,
                latitude,
                longitude,
                appliedCoupon,
                discountAmount: createdOrders.length === 0 ? (discountAmount || 0) : 0 // Apply discount only to first split order
            });

            createdOrders.push(newOrder);

            if (io) {
                io.to(vId.toString()).emit('new-order', newOrder);
            }
        }

        if (createdOrders.length === 0) {
            return errorResponse(res, 400, 'No valid orders could be created');
        }

        // 3. Update User promotional data
        if (appliedCoupon) {
            const user = await User.findById(userId);
            if (user) {
                // Add to used coupons
                if (!user.usedCoupons.includes(appliedCoupon)) {
                    user.usedCoupons.push(appliedCoupon);
                }

                // Handle WELCOME50 specific logic
                if (appliedCoupon === 'WELCOME50') {
                    user.isEligibleForWelcome50 = false;
                    user.freeDeliveriesCount += 3; // WELCOME50 gives 3 free deliveries
                }

                // If it was just a regular free delivery coupon (simplified)
                if (appliedCoupon === 'FREESHIP' && user.freeDeliveriesCount > 0) {
                    // Only decrement if we actually used a general credit? 
                    // Usually coupons are separate from credits. 
                    // But if user has credits, we might want to track that too.
                }

                await user.save();
            }
        }

        // Return the list of orders (or just the first one if legacy frontend expects object)
        // To be safe for legacy frontend handling "res.data", we can return the array.
        // If frontend expects a single object, this might break it. 
        // But "Success" message usually ignored. The data payload is important.
        // Let's return the array.
        successResponse(res, 201, 'Order(s) created successfully', createdOrders);

    } catch (error) {
        next(error);
    }
};

// @desc    Update Order Status
// @route   PATCH /order/:id/status
// @access  Private (Vendor)
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, cancellationReason } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(id);
        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Check if the logged in user is the vendor for this order
        const vendor = await Vendor.findById(order.vendorId);
        if (!vendor || vendor.vendorUserId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Not authorized to update this order');
        }

        order.status = status;
        if (cancellationReason) {
            order.cancellationReason = cancellationReason;
        }
        await order.save();

        // Send Notification to Customer
        try {
            const customer = await User.findById(order.userId);
            console.log(`[Notification] Attempting to notify customer ${order.userId} about order ${order._id}. Status: ${status}`);

            if (customer && customer.fcmToken) {
                let title = 'Order Update';
                let body = `Your order #${order._id.toString().slice(-6)} is now ${status}`;

                if (status === 'Accepted') {
                    title = 'Order Accepted ✅';
                    body = 'Your order has been accepted and is being processed.';
                } else if (status === 'Cancelled') {
                    title = 'Order Cancelled ❌';
                    body = `Your order was cancelled. Reason: ${cancellationReason || 'Unavailable'}`;
                } else if (status === 'Rejected') {
                    title = 'Order Rejected ❌';
                    body = 'Your order was rejected by the vendor.';
                } else if (status === 'Ready') {
                    title = 'Order Ready 🥡';
                    body = 'Your order is ready for pickup/delivery!';
                } else if (status === 'Out for Delivery') {
                    title = 'Out for Delivery 🛵';
                    body = 'Your order is on the way!';
                } else if (status === 'Delivered') {
                    title = 'Order Delivered 🏁';
                    body = 'Enjoy your purchase!';
                } else if (status === 'Preparing') {
                    title = 'Preparing Order 🍳';
                    body = 'The vendor is preparing your order.';
                }

                console.log(`[Notification] Sending: "${title}" to token: ${customer.fcmToken.slice(0, 10)}...`);

                // Send async - don't block response
                sendPushNotification(customer.fcmToken, title, body, {
                    orderId: order._id.toString(),
                    type: 'order_update',
                    status: status
                });
            } else {
                console.warn(`[Notification] Skipping: ${customer ? 'User has no FCM Token' : 'Customer not found'}`);
            }
        } catch (e) {
            console.error('Notification error:', e.message);
        }

        successResponse(res, 200, 'Order status updated', order);
    } catch (error) {
        next(error);
    }
};



// @desc    Get All Orders for Logged-in Vendor
// @route   GET /api/order/vendor
// @access  Private (Vendor)
const getVendorOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Find the Vendor associated with this logged-in VendorUser
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor) {
            return errorResponse(res, 404, 'Vendor profile not found for this user');
        }

        // 2. Fetch orders ONLY for this vendor
        const orders = await Order.find({ vendorId: vendor._id })
            .sort({ createdAt: -1 }); // Newest first

        successResponse(res, 200, 'Vendor Orders', orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Orders for Customer
// @route   GET /api/order/customer/:userId
// @access  Public (for demo purposes, as customer auth isn't strict)
const getCustomerOrders = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ userId })
            .populate('vendorId', 'businessType') // Optional: populate vendor details if needed
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Customer Orders', orders);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    updateOrderStatus,
    getVendorOrders,
    getCustomerOrders
};
