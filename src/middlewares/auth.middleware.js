const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const VendorUser = require('../models/VendorUser');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await VendorUser.findById(decoded.id).select('-password');
            if (!req.user) {
                return errorResponse(res, 401, 'Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            return errorResponse(res, 401, 'Not authorized, token failed');
        }
    }

    if (!token) {
        return errorResponse(res, 401, 'Not authorized, no token');
    }
};

module.exports = { protect };
