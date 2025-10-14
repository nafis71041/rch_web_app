const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/authServices');
const ApiError = require('../../utils/apiError');
const { users } = require('../../models/user_models/users'); // adjust path if needed

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, 'username and password are required');
    }

    // Find user by username (or email if your schema supports that)
    const user = await users.findOne({ where: { username } });

    if (!user) {
      throw new ApiError(401, 'invalid username or password');
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'invalid username or password');
    }

    // Generate JWT
    const token = generateToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    return res.status(200).json({
      message: 'login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.user_id; // from authMiddleware

    if (!current_password || !new_password) {
      throw new ApiError(400, 'both current and new password required');
    }

    const user = await users.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'user not found');
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'current password incorrect');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashedPassword });

    return res.status(200).json({ message: 'password changed successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * (Since JWT is stateless, logout is handled on client by removing token)
 */
async function logout(req, res) {
  return res.status(200).json({ message: 'logged out successfully' });
}

async function register(req, res, next) {
  try {
    const { username, password, role } = req.body;

    // Basic validation
    if (!username || !password || !role) {
      throw new ApiError(400, 'username, password, and role are required');
    }

    // Role validation
    const validRoles = ['asha', 'health_worker', 'supervisor', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ApiError(400, 'invalid role; must be one of asha, health_worker, or supervisor');
    }

    // Check if user already exists
    const existingUser = await users.findOne({ where: { username } });
    if (existingUser) {
      throw new ApiError(409, 'user with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const newUser = await users.create({
      username,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      message: 'user registered successfully',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, changePassword, logout, register };