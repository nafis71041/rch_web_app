// backend/controllers/auth_controller/auth_controller.js

const bcrypt = require('bcrypt'); // for password hashing
const jwt = require('jsonwebtoken');
const { users } = require('../../models/user_models/users'); // adjust path to your user model
require('dotenv').config();

/**
 * Login handler
 * POST /api/auth/login
 * Body: { username, password }
 */
async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Find user in the database
        const user = await users.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const payload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }); // token valid for 8 hours

        // Respond with token and basic user info
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { login };
