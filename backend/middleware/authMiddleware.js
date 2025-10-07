// backend/utils/authMiddleware.js

const jwt = require('jsonwebtoken');
const { users } = require('../models/user_models/user'); // adjust path to your user model
require('dotenv').config();

/**
 * Middleware to verify JWT token and attach user info to request
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Expected: 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        // Attach user info to request
        req.user = user; // { user_id, username, role }
        next();
    });
}

/**
 * Middleware to restrict access based on role(s)
 * @param {...string} allowedRoles - e.g., 'asha', 'health_worker', 'supervisor'
 */
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'User not authenticated' });

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }

        next();
    };
}

module.exports = { authenticateToken, authorizeRoles };
