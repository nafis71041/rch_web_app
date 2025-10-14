const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/authServices');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new ApiError(401, 'authorization header missing'));
  }
  if (!authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'authorization header malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'user not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'access denied: insufficient permissions'));
    }

    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
