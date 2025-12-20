const express = require('express');
const { addMenuItem, getMenu, updateMenuStatus, updateMenuItem, deleteMenuItem } = require('../controllers/restaurant.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/menu', protect, addMenuItem);
router.patch('/menu/:menuId/status', protect, updateMenuStatus);
router.put('/menu/:menuId', protect, updateMenuItem);
router.delete('/menu/:menuId', protect, deleteMenuItem);
router.get('/menu/:vendorId', getMenu);

module.exports = router;
