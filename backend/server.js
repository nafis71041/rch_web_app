const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('./db/connection');

const express = require('express');
const app = express();

const configureMiddleware = require('./middleware/middleware');
configureMiddleware(app);

const authRoutes = require('./api/auth');
// const ecRoutes = require('./api/ec');
// const pwRoutes = require('./api/pw');
// const childRoutes = require('./api/child');
// const dashboardRoutes = require('./api/dashboard');
// const motherRoutes = require('./api/mother');

app.use('/api/auth', authRoutes);
// app.use('/api/ec', ecRoutes);
// app.use('/api/pw', pwRoutes);
// app.use('/api/child', childRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/mother', motherRoutes);

const errorHandler = require('./middleware/errorHandler');
errorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

(async () => {

  try {
    if (!process.env.DB_HOST) throw new Error('DB_HOST missing');
    console.log('✅ environment variable DB_HOST loaded');
  } catch (err) {
    console.log('❌ environment variables DB_HOST not loaded');
    console.log(err)
  }

  try {
    await pool.authenticate();
    console.log('✅ database connection successful');
  } catch (err) {
    console.log('❌ database connection unsuccessful');
    console.log(err);
  }
})();

// // export app if needed for testing
// module.exports = app;