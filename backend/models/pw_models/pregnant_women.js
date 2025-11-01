const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { eligible_couple } = require('../ec_models/eligible_couple');

const pregnant_women = sequelize.define('pregnant_women', {
    pregnant_woman_id: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    mother_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: eligible_couple,
            key: 'mother_id'
        }
    },
    weight: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    height: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    lmp_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    edd_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    blood_group: {
        type: DataTypes.ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-'),
        allowNull: false
    },
    past_illnesses: {
        type: DataTypes.JSON,
        allowNull: true
    },
    total_no_of_pregnancies: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expected_delivery_place: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'pregnant_women',
    timestamps: false
});

// Association
pregnant_women.belongsTo(eligible_couple, { foreignKey: 'mother_id' });

module.exports = { pregnant_women };
