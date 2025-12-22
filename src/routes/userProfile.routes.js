const express = require('express');
const { updateProfile, saveAddress, getProfile, updateFcmToken } = require('../controllers/userProfile.controller');
const { protectUser } = require('../middlewares/userAuth.middleware');

const router = express.Router();

router.put('/update', protectUser, updateProfile);
router.post('/address', protectUser, saveAddress);
router.get('/', protectUser, getProfile);
router.patch('/fcm-token', protectUser, updateFcmToken);

module.exports = router;
