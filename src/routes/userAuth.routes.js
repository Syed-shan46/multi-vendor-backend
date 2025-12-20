const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/userAuth.controller');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/firebase', require('../controllers/userAuth.controller').userFirebaseAuth);

module.exports = router;
