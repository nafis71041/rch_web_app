// backend/models/pw_models/delivery.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { pregnant_women } = require('./pregnant_women');

const delivery = sequelize.define('delivery', {
    delivery_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pregnant_woman_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: { model: pregnant_women, key: 'pregnant_woman_id' }
    },
    place_of_delivery: { type: DataTypes.ENUM('hospital','home','other'), allowNull: false },
    location_of_delivery: { type: DataTypes.STRING(255), allowNull: false },
    delivery_complication: { type: DataTypes.BOOLEAN, allowNull: false },
    delivery_complication_details: { type: DataTypes.STRING(255), allowNull: true },
    number_of_children_born: { type: DataTypes.INTEGER, allowNull: false },
    live_birth_count: { type: DataTypes.INTEGER, allowNull: false },
    still_birth_count: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'delivery', timestamps: false });

module.exports = { delivery };
