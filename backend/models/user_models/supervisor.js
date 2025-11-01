const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');

const supervisor = sequelize.define('supervisor', {
    supervisor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_no: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'supervisor',
    timestamps: false
});

module.exports = { supervisor };
