const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { eligible_couple } = require('./eligible_couple');

const ec_visit = sequelize.define('ec_visit', {
    visit_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mother_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: eligible_couple,
            key: 'mother_id'
        }
    },
    visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    family_planning_method: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    method_used: {
        type: DataTypes.ENUM('condom','pills','copper_t','iud','others'),
        allowNull: true
    },
    period_missed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    pregnancy: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'ec_visit',
    timestamps: false
});

// Association
ec_visit.belongsTo(eligible_couple, { foreignKey: 'mother_id' });

module.exports = { ec_visit };
