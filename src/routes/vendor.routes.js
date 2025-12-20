const express = require('express');
const {
    createVendor,
    createVendorProfile,
    createVendorLocation,
    submitVendor,
    getVendorStatus,
    updateProfile
} = require('../controllers/vendor.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
// Note: ROLE middleware isn't exported as 'authorize' but 'protect' was.
// Checking previous middleware file...
// src/middlewares/role.middleware.js exported { authorize }
// src/middlewares/auth.middleware.js exported { protect }

const router = express.Router();

// Check Status
router.get('/status', protect, getVendorStatus);

// Step 1.5
// Note: These should technically be protected too, or have internal protection
router.post('/create', protect, createVendor);

// Step 2
router.post('/profile', protect, createVendorProfile);

// Step 3
router.post('/location', protect, createVendorLocation);

// Step 6
router.post('/submit', protect, submitVendor);

// Update Profile
router.put('/profile/update', protect, updateProfile);

module.exports = router;
