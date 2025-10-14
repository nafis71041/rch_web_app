const apiError = require("../utils/apiError");

function errorHandler(app) {
    // 6. 404 handler for unmatched routes (basic middleware)
    app.use((req, res, next) => {
        next(new apiError(404, "route not found"));
    });

    // 7. Error-handling middleware
    app.use((err, req, res, next) => {
        // console.error(`[ERROR] ${req.method} ${req.url}`);
        // console.error(err.stack);
        
        // If it's our custom error, use its details
        const statusCode = err.statusCode || 500;
        const message = err.message || "internal server rrror";
        const details = err.details || null;

        console.error('🔴', err.message);

        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            details,
        });
    });
}

module.exports = errorHandler;