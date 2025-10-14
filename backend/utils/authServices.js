const jwt = require("jsonwebtoken");
const ApiError = require('./apiError');
require('dotenv').config();

function generateToken(user) {
  // jwt.sign(payload, secret, options)
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  if (!token) {
    throw new ApiError(401, "authorization token missing");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "token expired");
    }
    throw new ApiError(401, "invalid token");
  }
}

module.exports = {generateToken, verifyToken};