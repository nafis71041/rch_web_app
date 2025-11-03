// backend/models/child_models/immunization.js
const { DataTypes} = require('sequelize');
const sequelize = require('../../db/connection');
const { infant } = require('../pw_models/infant');

const immunization = sequelize.define('immunization', {
    immunization_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    infant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: infant,
            key: 'infant_id'
        }
    },
    vaccine_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isIn: [[
                'BCG', 'DPT_1', 'DPT_2', 'DPT_3', 'DPT_Booster',
                'HepB_0', 'HepB_1', 'HepB_2', 'HepB_3',
                'Measles_1', 'Measles_2',
                'OPV_0', 'OPV_1', 'OPV_2', 'OPV_3', 'OPV_Booster',
                'Vitamin_A_1', 'Vitamin_A_2', 'Vitamin_A_3',
                'Vitamin_A_4', 'Vitamin_A_5', 'Vitamin_A_6',
                'Vitamin_A_7', 'Vitamin_A_8', 'Vitamin_A_9'
            ]]
        }
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    actual_date_given: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    remarks: {
        type: DataTypes.STRING(255),
        allowNull: true
    },    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'immunization',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['infant_id', 'vaccine_name'] }
    ]
});

module.exports = { immunization };
