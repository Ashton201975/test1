const Sequelize = require('sequelize');
const db = require('../config/database');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

const Promotion = db.define('promotion', {
    PromotionName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    EmailLimit: {
        type: Sequelize.STRING,
        allowNull: false
    },
    RedemptionPerPerson: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    TotalRedemption: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    PromotionAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    PromotionCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Purpose: {
        type: Sequelize.STRING(2000),
        allowNull: false
    },
    StartOfPromotion: {
        type: Sequelize.DATE,
        allowNull: false
    },
    EndOfPromotion: {
        type: Sequelize.DATE,
        allowNull: false
    },
    ValidPromo: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = Promotion;
