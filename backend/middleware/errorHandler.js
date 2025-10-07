function errorHandler(app) {
    // 6. 404 handler for unmatched routes (basic middleware)
    app.use((req, res, next) => {
        res.status(404).json({ error: 'Route not found' });
    });

    // 7. Error-handling middleware
    app.use((err, req, res, next) => {
        console.error('Error:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    });
}

module.exports = errorHandler;