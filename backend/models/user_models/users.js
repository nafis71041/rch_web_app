const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');

const users = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('asha','health_worker','supervisor'),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = { users };
