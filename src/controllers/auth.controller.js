const VendorUser = require('../models/VendorUser');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const Otp = require('../models/Otp');

// @desc    Send OTP to mobile
// @route   POST /auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
    try {
        const { mobile, isRegister } = req.body;
        if (!mobile) {
            return errorResponse(res, 400, 'Please add a mobile number');
        }

        // Check if user exists for Login flow
        if (isRegister !== true) {
            const user = await VendorUser.findOne({ mobile });
            if (!user) {
                return errorResponse(res, 404, 'User not found. Please register first.');
            }
        }

        // Optional: Check if user already exists for Register flow
        if (isRegister === true) {
            const user = await VendorUser.findOne({ mobile });
            if (user) return errorResponse(res, 400, 'User already exists. Please login.');
        }

        // Generate 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Save OTP to DB (upsert if exists for this mobile to avoid clutter, or just create new)
        // For simplicity, we just create new. Optionally delete old ones for this mobile.
        await Otp.deleteMany({ mobile });
        await Otp.create({ mobile, otp: otpCode });

        // MOCK SENDING SMS
        console.log(`[MOCK SMS] OTP for ${mobile} is: ${otpCode}`);

        successResponse(res, 200, `OTP sent successfully to ${mobile} (Check Console)`, {
            mobile,
            message: "OTP sent"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and Register/Login (Passwordless)
// @route   POST /auth/verify-otp
// @access  Public
const verifyOtpAndRegister = async (req, res, next) => {
    try {
        const { mobile, otp, role, ownerName, isRegister } = req.body;
        if (!mobile || !otp) {
            return errorResponse(res, 400, 'Please provide mobile and OTP');
        }

        // Check OTP in DB
        const otpRecord = await Otp.findOne({ mobile, otp });
        if (!otpRecord) {
            return errorResponse(res, 400, 'Invalid or expired OTP');
        }

        // OTP Valid - Find or Create User
        let user = await VendorUser.findOne({ mobile });

        let isNewUser = false;
        if (!user) {
            // Register New User
            if (isRegister !== true) {
                return errorResponse(res, 404, 'User not found. Please register first.');
            }
            user = await VendorUser.create({
                mobile,
                role: role || 'user',
                ownerName: ownerName || 'New User' // Use provided name or default
            });
            isNewUser = true;
        }

        // Generate Token
        const token = generateToken(user._id, user.role);

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        console.log(`[AUTH] User ${mobile} (${user.role}) successfully ${isNewUser ? 'registered' : 'logged in'} via OTP.`);

        successResponse(res, 200, isNewUser ? 'User registered successfully' : 'Login successful', {
            _id: user._id,
            ownerName: user.ownerName,
            mobile: user.mobile,
            role: user.role,
            token
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendOtp,
    verifyOtp: verifyOtpAndRegister // Exporting as verifyOtp to keep route compatibility or we can update route
};
