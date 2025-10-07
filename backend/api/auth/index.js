const express = require('express');
const router = express.Router();
const { login } = require('../../controllers/auth_controller/auth_controller');

// Example route
router.get('/login', (req, res) => {
  res.send('Login route works!');
});

// Public login route
router.post('/login', login);

module.exports = router;