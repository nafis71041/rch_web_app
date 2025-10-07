// backend/models/pw_models/anc.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { pregnant_women } = require('./pregnant_women'); // FK reference

const anc = sequelize.define('anc', {
    anc_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    pregnant_woman_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: pregnant_women,
            key: 'pregnant_woman_id'
        }
    },
    anc_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anc_date: { type: DataTypes.DATEONLY, allowNull: false },
    abortion: { type: DataTypes.BOOLEAN, allowNull: false },
    abortion_reason: { type: DataTypes.STRING(255), allowNull: true },
    weight: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    blood_pressure: { type: DataTypes.STRING(20), allowNull: false },
    urine_test_result: { type: DataTypes.STRING(255), allowNull: false },
    blood_test_result: { type: DataTypes.STRING(255), allowNull: false },
    hiv_test_result: { type: DataTypes.ENUM('positive','negative'), allowNull: true },
    hbsag_test_result: { type: DataTypes.ENUM('positive','negative'), allowNull: true },
    syphilis_test_result: { type: DataTypes.ENUM('positive','negative'), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'anc',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['pregnant_woman_id','anc_number'] }
    ]
});

module.exports = { anc };
