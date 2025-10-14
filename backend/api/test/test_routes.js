const express = require('express');
const router = express.Router();

// Root test route
router.get('/', (req, res) => {
    // res.send('Server is running');
    res.json({ message: 'server is running' });
    console.log('🟢 server is running');
});

// Sample GET route
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Sample POST route
router.post('/echo', (req, res) => {
    const { data } = req.body;
    res.json({ received: data });
});

module.exports = router;
