const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Send OTP to User mobile
// @route   POST /api/user/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
    try {
        const { mobile } = req.body;
        if (!mobile) {
            return errorResponse(res, 400, 'Please add a mobile number');
        }

        // Generate 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Save OTP to DB (upsert/replace)
        await Otp.deleteMany({ mobile }); // Clear old OTPs
        await Otp.create({ mobile, otp: otpCode });

        // MOCK SENDING SMS
        console.log(`[USER MOCK SMS] OTP for ${mobile} is: ${otpCode}`);

        successResponse(res, 200, `OTP sent successfully to ${mobile}`, {
            mobile,
            message: "OTP sent"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and Create/Login User
// @route   POST /api/user/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return errorResponse(res, 400, 'Please provide mobile and OTP');
        }

        // Check OTP
        const otpRecord = await Otp.findOne({ mobile, otp });
        if (!otpRecord) {
            return errorResponse(res, 400, 'Invalid or expired OTP');
        }

        // Find or Create User
        let user = await User.findOne({ mobile });
        let isNewUser = false;

        if (!user) {
            user = await User.create({
                mobile,
                isVerified: true
            });
            isNewUser = true;
        } else {
            // Ensure verified if not already
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }

        // Generate Token
        // Assuming generateToken handles generic payload or we pass 'user' role
        const token = generateToken(user._id, 'customer');

        // Cleanup OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        console.log(`[USER AUTH] User ${mobile} logged in.`);

        successResponse(res, 200, isNewUser ? 'User registered successfully' : 'Login successful', {
            _id: user._id,
            mobile: user.mobile,
            name: user.name,
            role: 'customer',
            token
        });
    } catch (error) {
        next(error);
    }
};



// @desc    Firebase Auth (Login or Register)
// @route   POST /api/user/auth/firebase
// @access  Public
const userFirebaseAuth = async (req, res, next) => {
    try {
        const { phoneNumber, firebaseUid, fcmToken } = req.body; // Accept fcmToken

        if (!phoneNumber || !firebaseUid) {
            return errorResponse(res, 400, 'Phone number and Firebase UID are required');
        }

        // Check if user exists
        let user = await User.findOne({ mobile: phoneNumber });
        let isNewUser = false;

        if (!user) {
            // REGISTER: Create new user
            user = await User.create({
                mobile: phoneNumber,
                firebaseUid: firebaseUid,
                fcmToken: fcmToken || null, // Save FCM Token
                isVerified: true
            });
            isNewUser = true;
            console.log(`[USER AUTH] New user registered: ${phoneNumber}`);
        } else {
            // LOGIN: Ensure verified and update details
            user.isVerified = true;
            if (!user.firebaseUid) user.firebaseUid = firebaseUid;
            if (fcmToken) user.fcmToken = fcmToken; // Update FCM Token
            await user.save();

            console.log(`[USER AUTH] User logged in: ${phoneNumber}`);
        }

        // Generate Token
        const token = generateToken(user._id, 'customer');

        successResponse(res, 200, isNewUser ? 'User registered successfully' : 'Login successful', {
            _id: user._id,
            mobile: user.mobile,
            name: user.name,
            role: 'customer',
            token
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    userFirebaseAuth
};