const express = require('express');
const { createCategory, getCategories, deleteCategory } = require('../controllers/category.controller');
// const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', createCategory);
router.get('/:vendorId', getCategories);
router.delete('/:categoryId', deleteCategory);

module.exports = router;
