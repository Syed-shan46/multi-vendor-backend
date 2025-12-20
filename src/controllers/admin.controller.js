const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get Vendors by Status
// @route   GET /admin/vendors
// @access  Private (Admin)
const getVendors = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const vendors = await Vendor.find(query).populate('vendorUserId', 'ownerName mobile email');

        successResponse(res, 200, 'Vendors retrieved', vendors);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve Vendor
// @route   PATCH /admin/vendor/:id/approve
// @access  Private (Admin)
const approveVendor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found');
        }

        vendor.status = 'approved';
        await vendor.save();

        successResponse(res, 200, 'Vendor approved', vendor);
    } catch (error) {
        next(error);
    }
};

// @desc    Reject Vendor
// @route   PATCH /admin/vendor/:id/reject
// @access  Private (Admin)
const rejectVendor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor not found');
        }

        vendor.status = 'rejected';
        await vendor.save();

        successResponse(res, 200, 'Vendor rejected', vendor);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendors,
    approveVendor,
    rejectVendor
};
