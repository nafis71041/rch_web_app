// backend/models/pw_models/infant.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { pregnant_women } = require('./pregnant_women');

const infant = sequelize.define('infant', {
    child_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pregnant_woman_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: { model: pregnant_women, key: 'pregnant_woman_id' }
    },
    sex: { type: DataTypes.ENUM('male','female'), allowNull: false },
    weight_at_birth: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    head_circumference: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    cried_after_birth: { type: DataTypes.BOOLEAN, allowNull: false },
    yellow_milk_given: { type: DataTypes.BOOLEAN, allowNull: false },
    yellow_milk_not_given_reason: { type: DataTypes.STRING(255), allowNull: true },
    opv_0: { type: DataTypes.DATEONLY, allowNull: false },
    bcg_0: { type: DataTypes.DATEONLY, allowNull: false },
    hepb_0: { type: DataTypes.DATEONLY, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'infant', timestamps: false });

module.exports = { infant };
