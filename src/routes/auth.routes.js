const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/auth.controller');
const { firebaseAuth, deleteTestUser } = require('../controllers/firebaseAuth.controller');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/firebase-auth', firebaseAuth);
router.delete('/test-user/:phoneNumber', deleteTestUser); // For development only

module.exports = router;
