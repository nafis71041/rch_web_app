const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { supervisor } = require('./supervisor');

const health_worker = sequelize.define('health_worker', {
    health_worker_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_no: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: supervisor,
            key: 'supervisor_id'
        }
    }
}, {
    tableName: 'health_worker',
    timestamps: false
});

// Association
health_worker.belongsTo(supervisor, { foreignKey: 'supervisor_id' });

module.exports = { health_worker };
