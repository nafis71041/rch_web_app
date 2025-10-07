// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,           
//   queueLimit: 0
// });

// module.exports = pool.promise();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

module.exports = sequelize;