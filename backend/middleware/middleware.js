const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

function configureMiddleware(app) {
    // 1. Body parsing middleware
    app.use(express.json()); // parse JSON payloads
    app.use(express.urlencoded({ extended: true })); // parse URL-encoded payloads

    // 2. CORS configuration
    const corsOptions = {
        origin: 'http://localhost:3000', // frontend React app URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true, // allow cookies / auth headers
    };
    app.use(cors(corsOptions));

    // 3. Logging middleware
    app.use(morgan('dev')); // logs requests in dev format

    // 4. Custom request logging (for debugging flows)
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next(); // pass control to next middleware/route
    });

    // // 5. Simple request header logger (optional, useful for debugging auth headers)
    // app.use((req, res, next) => {
    //     console.log('Request headers:', req.headers);
    //     next();
    // });
}

module.exports = configureMiddleware;
