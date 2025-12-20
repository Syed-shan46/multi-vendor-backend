const VendorUser = require('../models/VendorUser');
const jwt = require('jsonwebtoken');

/**
 * Firebase Auth - Login/Register with Firebase UID
 * POST /api/auth/firebase-auth
 */
exports.firebaseAuth = async (req, res) => {
    try {
        const { phoneNumber, firebaseUid, ownerName, isRegister } = req.body;

        // Debug logging
        console.log('Firebase Auth Request:', {
            phoneNumber,
            firebaseUid: firebaseUid ? 'present' : 'missing',
            ownerName,
            isRegister
        });

        // Validate required fields
        if (!phoneNumber || !firebaseUid) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Phone number and Firebase UID are required'
            });
        }

        // Check if user exists (using mobile field)
        let user = await VendorUser.findOne({ mobile: phoneNumber });
        console.log('User lookup result:', user ? 'Found' : 'Not found');

        if (isRegister) {
            // Registration flow
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists. Please login instead.'
                });
            }

            if (!ownerName) {
                return res.status(400).json({
                    success: false,
                    message: 'Owner name is required for registration'
                });
            }

            // Create new user (mobile is required field in schema)
            user = await VendorUser.create({
                mobile: phoneNumber,  // Use 'mobile' field as required by schema
                phoneNumber: phoneNumber,  // Also set phoneNumber for compatibility
                firebaseUid,
                ownerName,
                role: 'vendor'
            });

            console.log(`New vendor registered: ${phoneNumber}`);
        } else {
            // Login flow
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found. Please register first.'
                });
            }

            // Update Firebase UID if not set
            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
                await user.save();
            }

            console.log(`Vendor logged in: ${phoneNumber}`);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: isRegister ? 'Registration successful' : 'Login successful',
            token,
            data: {  // Changed from 'user' to 'data' to match AuthResponse format
                _id: user._id.toString(),
                mobile: user.mobile,
                ownerName: user.ownerName,
                role: user.role,
                token: token
            }
        });

    } catch (error) {
        console.error('Firebase auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

/**
 * Delete test user by phone number (for development only)
 * DELETE /api/auth/test-user/:phoneNumber
 */
exports.deleteTestUser = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        console.log(`Deleting test user: ${phoneNumber}`);

        const result = await VendorUser.deleteOne({ mobile: phoneNumber });

        if (result.deletedCount > 0) {
            res.status(200).json({
                success: true,
                message: `User ${phoneNumber} deleted successfully`
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};
