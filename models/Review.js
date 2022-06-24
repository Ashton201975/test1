const Sequelize = require('sequelize');
const db = require('../config/database');
const Review = db.define('review', {
    title: {
        type: Sequelize.STRING
    },
    rating: {
        type: Sequelize.STRING
    },
    story: {
        type: Sequelize.STRING(2000)
    },

    dateRelease: {
        type: Sequelize.DATE
    }
});
module.exports = Review;