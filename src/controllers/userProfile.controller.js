const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Update User Name
// @route   PUT /api/user/profile/update
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        // req.user is populated by protect middleware
        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        user.name = name || user.name;
        await user.save();

        successResponse(res, 200, 'Profile updated successfully', {
            _id: user._id,
            mobile: user.mobile,
            name: user.name,
            role: 'customer',
            token: req.token // Pass back token if needed, or client keeps exist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Address
// @route   POST /api/user/profile/address
// @access  Private
const saveAddress = async (req, res, next) => {
    try {
        console.log("Saving address for user:", req.user ? req.user._id : "No User");
        console.log("Address Body:", req.body);

        const { type, houseNo, area, description, receiverName, receiverPhone, lat, lng } = req.body;

        if (!['Home', 'Work'].includes(type)) {
            return errorResponse(res, 400, 'Invalid address type. Must be Home or Work.');
        }

        const user = await User.findById(req.user._id);
        if (!user) return errorResponse(res, 404, 'User not found');

        // Check if address of this type exists
        const existingIndex = user.addresses.findIndex(addr => addr.type === type);

        const newAddress = {
            type,
            houseNo,
            area,
            description,
            receiverName,
            receiverPhone,
            lat,
            lng
        };

        if (existingIndex !== -1) {
            // Update existing
            user.addresses[existingIndex] = newAddress;
        } else {
            // Add new
            user.addresses.push(newAddress);
        }

        await user.save();
        console.log("Address saved successfully");

        successResponse(res, 200, 'Address saved successfully', {
            addresses: user.addresses
        });

    } catch (error) {
        console.error("Save Address Error:", error);
        next(error);
    }
};

// @desc    Get User Profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        successResponse(res, 200, 'User profile fetched successfully', {
            _id: user._id,
            mobile: user.mobile,
            name: user.name,
            role: user.role,
            addresses: user.addresses,
            token: req.token // Or reuse existing token if middleware attaches it
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    saveAddress,
    getProfile
};
