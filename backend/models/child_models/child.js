// backend/models/child_models/child.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { eligible_couple } = require('../ec_models/eligible_couple');
const { infant } = require('../pw_models/infant');

const child = sequelize.define('child', {
    child_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    infant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        references: { model: infant, key: 'infant_id' }
    },
    mother_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: eligible_couple, key: 'mother_id' }
    },
    child_name: { type: DataTypes.STRING(255), allowNull: true },
    sex: { type: DataTypes.ENUM('male','female'), allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
    weight_at_birth: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    place_of_delivery: { type: DataTypes.STRING(255), allowNull: false },
    birth_certificate_number: { type: DataTypes.STRING(50), allowNull: true },
    birth_registration_status: { type: DataTypes.BOOLEAN, allowNull: false },
    aadhaar_enrollment_status: { type: DataTypes.BOOLEAN, allowNull: true },
    father_phone_number: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: false },
    guardian_name: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'child', timestamps: false });

child.belongsTo(infant, {
    foreignKey: 'infant_id'
});

child.belongsTo(eligible_couple, {
    foreignKey: 'mother_id'
});

module.exports = { child };
