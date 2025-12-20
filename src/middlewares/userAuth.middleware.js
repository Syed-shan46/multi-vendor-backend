const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const User = require('../models/User');

const protectUser = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id);
            req.token = token; // Pass token just in case

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

module.exports = { protectUser };
