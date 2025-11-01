const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');
const { village } = require('./village');

const asha = sequelize.define('asha', {
    asha_id: {
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
    village_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: village,
            key: 'village_id'
        }
    }
}, {
    tableName: 'asha',
    timestamps: false
});

// Association
asha.belongsTo(village, { foreignKey: 'village_id' });

module.exports = { asha };
