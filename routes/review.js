const express = require('express');
const router = express.Router();
const moment = require('moment');
const Review = require('../models/Review');
const ensureAuthenticated = require('../helpers/auth');
const alertMessage = require('../helpers/messenger')

// List reviews belonging to current logged in user
router.get('/listReviews', (req, res) => {
    Review.findAll({
        where: {
            
        },
        order: [
            ['title', 'ASC']
        ],
        raw: true
    })
        .then((reviews) => {
            // pass object to listReviews.handlebar
            res.render('review/listReviews', {
                reviews: reviews
            });
        })
        .catch(err => console.log(err));
});

//add new review
router.get('/showAddReview', (req, res) => {
    res.render('review/addReviews');
});
module.exports = router;

// Adds new review  from /review/addReview
router.post('/addReview', (req, res) => {
    let title = req.body.title;
    let rating = req.body.rating;
    let story = req.body.story.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let userId = req.user.id;
    // Multi-value components return array of strings or undefined
    Review.create({
        title,
        rating,
        story,
        dateRelease,
        userId
    }).then((review) => {
        res.redirect('/review/listReviews');
    })
        .catch(err => console.log(err))
});

// Shows edit review page
router.get('/edit/:id', (req, res) => {
    Review.findOne({
        where: {
            id: req.params.id
        }
    }).then((review) => {
        //only authorised user which is the owner can edit
        if (req.user.id === review.userId) {
            // call views/review/editReview.handlebar to render the edit review page
            res.render('review/editReview', {
                review
                // passes review object to handlebar
            });
        } else {//show error message and kick them out
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
    }).catch(err => console.log(err)); // To catch no review ID
});

// edit review  from /review/editReview
router.put('/saveEditedReview/:id', (req, res) => {
    let title = req.body.title;
    let rating = req.body.rating;
    let story = req.body.story.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    // Multi-value components return array of strings or undefined
    Review.update({
        title,
        rating,
        story,
        dateRelease,
    }, {
        where: {
            id: req.params.id
        }
    }).then((review) => {
        res.redirect('/review/listReviews');
    })
        .catch(err => console.log(err))
});


router.get('/delete/:id', (req, res) => {
    Review.findOne({
        where: {
            id: req.params.id
        }
    }).then((review) => {
        let reviewTitle = review.title;//store review title in title message
        //only authorised user which is the owner can edit
        if (req.user.id === review.userId) {
            Review.destroy({
                where: {
                    id: req.params.id
                }
            }).then(() => {
                alertMessage(res, 'success', reviewTitle + 'Review deleted', 'far fa-trash-alt', true);
                res.redirect('/review/listReviews')
            })
        } else {//show error message and kick them out
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
    }).catch(err => console.log(err)); // To catch no review ID
});