const express = require('express');
const { getVendors, approveVendor, rejectVendor } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Assuming admin role check should be here, but using protect for now.
// Ideally usage: protect, authorize('admin')
// I'll add authorize('admin') assuming the role middleware handles it.
// I need to import authorize middleware.
// Wait, I didn't export authorize in routes.
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);
router.use(authorize('admin')); // Only admin can access these routes

router.get('/vendors', getVendors);
router.patch('/vendor/:id/approve', approveVendor);
router.patch('/vendor/:id/reject', rejectVendor);

module.exports = router;
