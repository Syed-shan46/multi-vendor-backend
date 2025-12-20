const Vendor = require('../models/Vendor');
const VendorProfile = require('../models/VendorProfile');
const VendorLocation = require('../models/VendorLocation');
const GroceryProduct = require('../models/GroceryProduct');
const RestaurantMenu = require('../models/RestaurantMenu'); // For validation check
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Step 1.5: Create Vendor (Select Business Type)
// @route   POST /vendor/create
// @access  Private (Vendor)
const createVendor = async (req, res, next) => {
    try {
        const { businessType } = req.body;
        const userId = req.user._id;

        const vendorExists = await Vendor.findOne({ vendorUserId: userId });
        if (vendorExists) {
            return errorResponse(res, 400, 'Vendor already created for this user');
        }

        const vendor = await Vendor.create({
            vendorUserId: userId,
            businessType
        });

        successResponse(res, 201, 'Vendor created successfully', vendor);
    } catch (error) {
        next(error);
    }
};

// @desc    Step 2: Create/Update Vendor Profile
// @route   POST /vendor/profile
// @access  Private (Vendor)
const createVendorProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { businessName, businessLogo, gstNumber, description } = req.body;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found. Complete Step 1.5 first.');
        }

        // Check if profile exists, treat as upsert or strictly create. 
        // Prompt says "Create VendorProfile model ... POST /vendor/profile"
        // I'll implement upsert for better UX, or just create.

        let profile = await VendorProfile.findOne({ vendorId: vendor._id });
        if (profile) {
            profile.businessName = businessName || profile.businessName;
            profile.businessLogo = businessLogo || profile.businessLogo;
            profile.gstNumber = gstNumber || profile.gstNumber;
            profile.description = description || profile.description;
            await profile.save();
        } else {
            profile = await VendorProfile.create({
                vendorId: vendor._id,
                businessName,
                businessLogo,
                gstNumber,
                description
            });
        }

        successResponse(res, 200, 'Vendor profile saved', profile);
    } catch (error) {
        next(error);
    }
};

// @desc    Step 3: Create/Update Vendor Location
// @route   POST /vendor/location
// @access  Private (Vendor)
const createVendorLocation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const {
            address, pincode, latitude, longitude,
            openingTime, closingTime, deliveryRadius, selfPickup
        } = req.body;

        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found');
        }

        let location = await VendorLocation.findOne({ vendorId: vendor._id });
        if (location) {
            location.address = address;
            location.pincode = pincode;
            location.latitude = latitude;
            location.longitude = longitude;
            location.openingTime = openingTime;
            location.closingTime = closingTime;
            location.deliveryRadius = deliveryRadius;
            location.selfPickup = selfPickup;
            await location.save();
        } else {
            location = await VendorLocation.create({
                vendorId: vendor._id,
                address, pincode, latitude, longitude,
                openingTime, closingTime, deliveryRadius, selfPickup
            });
        }

        successResponse(res, 200, 'Vendor location saved', location);
    } catch (error) {
        next(error);
    }
};

// @desc    Step 6: Submit for Admin Approval
// @route   POST /vendor/submit
// @access  Private (Vendor)
const submitVendor = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found');
        }

        // Validation logic for minimum products has been removed as per request.
        // Vendors can now submit for approval before adding products.

        vendor.status = 'pending';
        await vendor.save();

        successResponse(res, 200, 'Vendor submitted for approval', vendor);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Vendor Status (Step tracking)
// @route   GET /api/vendor/status
// @access  Private
const getVendorStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });

        if (!vendor) {
            return successResponse(res, 200, 'Vendor Status', { step: 1, message: "Use /api/vendor/create to start" });
        }

        const profile = await VendorProfile.findOne({ vendorId: vendor._id });
        const location = await VendorLocation.findOne({ vendorId: vendor._id });

        if (!profile) {
            return successResponse(res, 200, 'Vendor Status', { step: 2, message: "Profile creation pending", vendor });
        }

        if (!location) {
            return successResponse(res, 200, 'Vendor Status', { step: 3, message: "Location setup pending", vendor, profile });
        }

        if (vendor.status === 'draft') {
            return successResponse(res, 200, 'Vendor Status', { step: 4, message: "Review & Submit", vendor, profile, location });
        }

        if (vendor.status === 'pending') {
            return successResponse(res, 200, 'Vendor Status', { step: 5, message: "Pending Approval", vendor, profile, location });
        }

        return successResponse(res, 200, 'Vendor Status', { step: 6, message: "Approved", vendor, profile, location });

    } catch (error) {
        next(error);
    }
};

// @desc    Update Vendor Profile
// @route   PUT /api/vendor/profile/update
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const vendor = await Vendor.findOne({ vendorUserId: userId });
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');

        const { businessName, description, openingTime, closingTime } = req.body;

        // Update Profile
        const updatedProfile = await VendorProfile.findOneAndUpdate(
            { vendorId: vendor._id },
            { businessName, description },
            { new: true }
        );

        // Update Location (Timing)
        const updatedLocation = await VendorLocation.findOneAndUpdate(
            { vendorId: vendor._id },
            { openingTime, closingTime },
            { new: true }
        );

        successResponse(res, 200, 'Profile Updated', { profile: updatedProfile, location: updatedLocation });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createVendor,
    createVendorProfile,
    createVendorLocation,
    submitVendor,
    getVendorStatus,
    updateProfile
};
