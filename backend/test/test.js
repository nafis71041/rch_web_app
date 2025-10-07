(async () => {

  try {
    if (!process.env.DB_HOST) throw new Error('DB_HOST missing');
    console.log('✅ environment variable DB_HOST loaded');
  } catch (err) {
    console.log('❌ environment variables DB_HOST not loaded');
    console.log(err)
  }

  try {
    await pool.getConnection();
    console.log('✅ database connection successful');
  } catch (err) {
    console.log('❌ database connection unsuccessful');
    console.log(err);
  }
})();