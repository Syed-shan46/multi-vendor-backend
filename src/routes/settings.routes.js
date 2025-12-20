const express = require('express');
const { updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/settings', updateSettings);

module.exports = router;
