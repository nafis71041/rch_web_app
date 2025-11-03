// backend/models/child_models/immunization.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { infant } = require('../pw_models/infant');

const immunization = sequelize.define('immunization', {
    immunization_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    infant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: infant, key: 'infant_id' }
    },
    vaccine_name: { type: DataTypes.STRING(100), allowNull: false },
    scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
    actual_date_given: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('pending','given','missed'), allowNull: false },
    remarks: { type: DataTypes.STRING(255), allowNull: true },
    dose_number: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'immunization',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['infant_id','vaccine_name'] }
    ]
});

module.exports = { immunization };
