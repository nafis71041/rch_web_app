// backend/models/pw_models/pnc.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { pregnant_women } = require('./pregnant_women');

const pnc = sequelize.define('pnc', {
    pnc_id: { type: DataTypes.STRING(50), primaryKey: true, allowNull: false },
    pregnant_woman_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: { model: pregnant_women, key: 'pregnant_woman_id' }
    },
    pnc_number: { type: DataTypes.INTEGER, allowNull: false },
    pnc_date: { type: DataTypes.DATEONLY, allowNull: false },
    complications: { type: DataTypes.BOOLEAN, allowNull: false },
    complication_details: { type: DataTypes.STRING(255), allowNull: true },
    mother_weight: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    mother_death: { type: DataTypes.BOOLEAN, allowNull: false },
    mother_death_details: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'pnc',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['pregnant_woman_id','pnc_number'] }
    ]
});

module.exports = { pnc };
