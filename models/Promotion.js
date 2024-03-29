const { max } = require('moment');
const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

const Promotion = db.define('promotion', {
    PromotionName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    EmailLimit: {
        type: Sequelize.STRING(2000),
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
