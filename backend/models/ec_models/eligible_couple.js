const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { asha } = require('../user_models/asha');

const eligible_couple = sequelize.define('eligible_couple', {
    mother_id: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    mother_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    father_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_no: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    aadhaar_id: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    account_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    branch_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ifsc_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    occupation_mother: {
        type: DataTypes.STRING,
        allowNull: true
    },
    occupation_father: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dob_mother: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    dob_father: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    date_of_registration: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    asha_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: asha,
            key: 'asha_id'
        }
    }
}, {
    tableName: 'eligible_couple',
    timestamps: false
});

// Association
eligible_couple.belongsTo(asha, { foreignKey: 'asha_id' });

module.exports = { eligible_couple };
