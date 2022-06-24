const Sequelize = require('sequelize');
const db = require('../config/database');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const User = db.define('user', {
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    gender: {
        type: Sequelize.STRING
    },
    birthday: {
        type: Sequelize.DATE
    },
    password: {
        type: Sequelize.STRING
    },
    imageURL: {
        type: Sequelize.STRING
    },
    dateJoined: {
        type: Sequelize.DATE
    },
    intolerances: {
        type: Sequelize.STRING
    },
    diet: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.STRING
    },
    unitNo: {
        type: Sequelize.STRING
    },
    zipCode: {
        type: Sequelize.STRING
    },
    cardNum: {
        type: Sequelize.STRING
    },
    cardExp: {
        type: Sequelize.STRING
    },
    verified: {
        type: Sequelize.BOOLEAN
    },

});

module.exports = User;