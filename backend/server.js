const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequel = require('./db/connection');
const express = require('express');
const configureMiddleware = require('./middleware/middleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
configureMiddleware(app);

const testRoutes = require('./api/test/test_routes');
const authRoutes = require('./api/auth/');
const ecRoutes = require('./api/ec/ec_routes');
// const pwRoutes = require('./api/pw');
// const childRoutes = require('./api/child');
const dashboardRoutes = require('./api/dashboard/dashboard_routes');
// const motherRoutes = require('./api/mother');

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ec', ecRoutes);
// app.use('/api/pw', pwRoutes);
// app.use('/api/child', childRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/mother', motherRoutes);

errorHandler(app);

if (!process.env.DB_HOST) {
  console.error('🔴 environment variables DB_HOST not loaded');
}
console.log('🟢 environment variable DB_HOST loaded');

sequel.authenticate()
  .then(() => {
    console.log('🟢 database connection successful');
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`🟢 server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('🔴 database connection unsuccessful');
    console.error('🔴 start up unsuccessful');
    // console.error(err);
    process.exit(1);
  });

// export app if needed for testing
module.exports = app;