const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { health_worker } = require('./health_worker');

const village = sequelize.define('village', {
    village_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    village_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    health_worker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: health_worker,
            key: 'health_worker_id'
        }
    }
}, {
    tableName: 'village',
    timestamps: false
});

// Association
village.belongsTo(health_worker, { foreignKey: 'health_worker_id' });

module.exports = { village };
