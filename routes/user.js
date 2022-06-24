const express = require('express');
const router = express.Router();

const moment = require('moment');
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');

const bcrypt = require('bcryptjs'); // for password encryption
const passport = require('passport');

// Require for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');

//SendGrid
const sgMail = require('@sendgrid/mail');
//JWT
const jwt = require('jsonwebtoken');

// User register URL using HTTP post => /user/register
router.post('/register', (req, res) => {
    //insert codes here
    let errors = [];
    // Retrieves fields from register page from request body
    let name = req.body.name;
    let email = req.body.email;
    let gender = req.body.gender;
    let birthdate = moment(req.body.birthdate, 'DD/MM/YYYY');
    let password = req.body.password;
    let password2 = req.body.password2;
    // Checks if both passwords entered are the same
    if (password !== password2) {
        errors.push({ text: 'Passwords do not match' });
    }
    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            name,
            gender,
            email,
            birthdate,
            password,
            password2
        });
    } else {
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/register', {
                        error: user.email + ' already registered',
                        name,
                        gender,
                        email,
                        birthdate,
                        password,
                        password2
                    });
                } else {
                    // Generate JWT token
                    let token;
                    jwt.sign(email, 's3cr3Tk3y', (err, jwtoken) => {
                        if (err) console.log('Error generating token: ' + err);
                        token = jwtoken;
                    });

                    // Generate salt hashed password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            password = hash;

                            // Create new user record
                            User.create({
                                name,
                                gender,
                                email,
                                birthday: birthdate,
                                password,
                                dateJoined: moment().format('L'),
                                role: "customer",
                                intolerances: "None",
                                diet: "None",
                                verified: 0, // Add this statement - Set Verified to False
                            }).then(user => {
                                sendEmail(user.id, user.email, token)
                                    .then(msg => {  // send email success
                                        alertMessage(res, 'success', user.name + ' added. Please logon to ' + user.email + ' to verify account.',
                                            'fas fa-sign-in-alt', true);
                                        res.redirect('/showLogin');
                                    }).catch(err => {       // send email fail
                                        alertMessage(res, 'warning', 'Error sending to ' + user.email, 'fas fa-sign-in-alt', true);
                                        res.redirect('/');
                                    });
                            }).catch(err => console.log(err));
                        });
                    });
                }
            });
    }
});

// Login Form POST => /user/login
router.post('/login', (req, res, next) => {
    // retrieve from user using email
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user) {  // if user is found
            if (user.verified === true) {    // check if user has been verified
                passport.authenticate('local', {
                    successRedirect: '/', // Route to /video/listVideos URL
                    failureRedirect: '/showLogin', // Route to /login URL
                    failureFlash: true
                    /* Setting the failureFlash option to true instructs Passport to flash an error message using the message given by
                    the strategy's verify callback, if any. When a failure occur, passport passes the message object as error */
                })(req, res, next);
            } else {
                // user not verified
                alertMessage(res, 'danger', user.email + ' has not been verified', 'fas fa-exclamation-circle', true);
                res.redirect('/');
            }
        } else {    // User not found
            alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
            res.redirect('/');
        }
    })
});

// Verify Email
router.get('/verify/:userId/:token', (req, res, next) => {
    //retrieve from user using id
    console.log(req.params.userId + req.params.token)
    User.findOne({
        where: {
            id: req.params.userId,
        }
    }).then(user => {
        if (user) {
            let userEmail = user.email;
            if (user.verified === true) {
                alertMessage(res, 'info', 'User already Verified', 'fas fa-exclamation-circle', true);
                res.redirect('/showLogin');
            } else {
                // Verify JWT token sent via URL
                jwt.verify(req.params.token, 's3cr3Tk3y', (err, authData) => {
                    if (err) {
                        alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
                        res.redirect('/');
                    } else {
                        User.update({ verified: 1 }, {
                            where: { id: user.id }
                        }).then(user => {
                            alertMessage(res, 'success', userEmail + ' verified. Please login', 'fas fa-sign-alt', true);
                            res.redirect('/showLogin');
                        });
                    }
                });
            }
        } else {
            alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
            res.redirect('/');

        }
    });
});

router.get('/profile', (req, res) => {
    User.findOne({
        where: {
            id: req.user.id
        }
    }).then((user) => {
        console.log(user);
        res.render('user/profile', {
            user: user
        });
    }).catch(err => console.log(err));
})

router.get('/updateBasic', (req, res) => {
    User.findOne({
        where: {
            id: req.user.id
        }
    }).then((user) => {
        console.log(user);
        res.render('user/updateBasic', {
            user: user
        });
    }).catch(err => console.log(err));
})

// Uplaod ProfilePic
router.post('/upload', (req, res) => {
    console.log('hello');
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id);
    }

    upload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
            }
        }
    });
})

// Save profile Image
router.post('/saveImage', (req, res) => {
    let imageURL = req.body.profilePicURL;

    User.update({
        imageURL,
    }, {
        where: {
            id: req.user.id
        }
    }).then((user) => {
        res.redirect('/user/profile');
    }).catch(err => console.log(err))
})

router.get('/:userId/updateDiet', (req, res) => {
    User.findOne({
        where: {
            id: req.params.userId
        }
    }).then((user) => {
        if (req.user.id === user.id) {
            checkOptions(user);

            res.render('user/updateDiet', {
                user
            });
        }
    })
})

router.post('/:userId/updateDiet', (req, res) => {
    let intolerances = req.body.intolerance === undefined ? '' : req.body.intolerance.toString();
    let diet = req.body.diet;

    User.update({
        intolerances,
        diet,
    }, {
        where: {
            id: req.params.userId
        }
    }).then((user) => {
        alertMessage(res, 'success', ' Dietary Requirements successfully updated', 'fa fa-check', true);
        res.redirect('/user/profile');
    }).catch(err => console.log(err))
});

router.get('/:userId/updateAddress', (req, res) => {
    User.findOne({
        where: {
            id: req.params.userId
        }
    }).then((user) => {
        if (req.user.id === user.id) {

            res.render('user/updateAddress', {
                user
            });
        }
    })
})

router.post('/:userId/updateAddress', (req, res) => {
    let zipCode = req.body.zipcode === undefined ? '' : req.body.zipcode.toString();
    let unitNo = req.body.unitNo === undefined ? undefined : req.body.unitNo.toString();

    User.update({
        zipCode,
        unitNo,
    }, {
        where: {
            id: req.params.userId
        }
    }).then((user) => {
        alertMessage(res, 'success', ' Postal Address successfully updated', 'fa fa-check', true);
        res.redirect('/user/profile');
    }).catch(err => console.log(err))
});

router.get('/:userId/updatePassword', (req, res) => {
    res.render('user/updatePassword');
});

router.post('/:userId/updatePassword', (req, res) => {
    let errors = [];
    let newPassword = req.body.newPassword;
    let newPassword2 = req.body.newPassword2;

    // Checks if both passwords entered are the same
    if (newPassword !== newPassword2) {
        errors.push({ text: 'New Passwords do not match' });
    }
    // Checks that password length is more than 4
    if (newPassword.length < 4) {
        errors.push({ text: 'New Password must be at least 4 characters' });
    }

    if (errors.length > 0) {
        res.render('user/updatePassword', {
            errors,
            newPassword,
            newPassword2,
        })
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, (err, hash) => {
                if (err) throw err;

                User.update({
                    password: hash,
                }, {
                    where: { id: req.params.userId }
                }).then((user) => {
                    alertMessage(res, 'success', ' Password successfully updated', 'fa fa-check', true);
                    res.redirect('/user/profile');
                }).catch(err => console.log(err))
            });
        });
    }
})

router.post('/:userId/delete', (req, res) => {
    User.findOne({
        where: {
            id: req.params.userId,
        }
    }).then((user) => {
        let userEmail = user.email;

        user.destroy({
            where: {
                id: req.params.userId,
            }
        }).then(() => {
            alertMessage(res, 'success', 'Account deleted for ' + userEmail, 'fas fa-trash-alt', true);
            res.redirect('/');
        })
    })
})

function sendEmail(userId, email, token) {
    sgMail.setApiKey('[INSERT API KEY HERE]');
    let verifyURL = 'http://localhost:5000/user/verify/' + userId + '/' + token;

    const message = {
        to: email,
        from: {
            name: 'Jamie',
            email: 'appdevproject9@gmail.com',
        },
        subject: 'Verify Video Jotter Account',
        text: 'Video Jotter Email Verification',
        html: 'Thank you for registering with Video Jotter.<br><br>Please <a href="' + verifyURL + '"><strong>verify</strong></a> your account.'
    };

    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(msg => {
                console.log(msg[0].statusCode);
                console.log(msg[0].headers);
                resolve(msg);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

// Creates variables with ‘check’ to put a tick in the appropriate checkbox
function checkOptions(user) {
    user.dairy = (user.intolerances.search('Dairy') >= 0) ? 'checked' : '';
    user.peanut = (user.intolerances.search('Peanut') >= 0) ? 'checked' : '';
    user.soy = (user.intolerances.search('Soy') >= 0) ? 'checked' : '';
    user.egg = (user.intolerances.search('Egg') >= 0) ? 'checked' : '';
    user.seafood = (user.intolerances.search('Seafood') >= 0) ? 'checked' : '';
    user.sulfite = (user.intolerances.search('Sulfite') >= 0) ? 'checked' : '';
    user.gluten = (user.intolerances.search('Gluten') >= 0) ? 'checked' : '';
    user.sesame = (user.intolerances.search('Sesame') >= 0) ? 'checked' : '';
    user.treeNut = (user.intolerances.search('Tree Nut') >= 0) ? 'checked' : '';
    user.grain = (user.intolerances.search('Grain') >= 0) ? 'checked' : '';
    user.shellfish = (user.intolerances.search('Shellfish') >= 0) ? 'checked' : '';
    user.wheat = (user.intolerances.search('Wheat') >= 0) ? 'checked' : '';

    user.none = (user.diet.search('None') >= 0) ? 'selected' : '';
    user.glutenFree = (user.diet.search('Gluten Free') >= 0) ? 'selected' : '';
    user.ketogenic = (user.diet.search('Ketogenic') >= 0) ? 'selected' : '';
    user.vegetarian = (user.diet.search('Vegetarian') >= 0) ? 'selected' : '';
    user.lactoVegetarian = (user.diet.search('Lacto-Vegetarian') >= 0) ? 'selected' : '';
    user.ovoVegetarian = (user.diet.search('Ovo-Vegetarian') >= 0) ? 'selected' : '';
    user.vegan = (user.diet.search('Vegan') >= 0) ? 'selected' : '';
    user.pescetarian = (user.diet.search('Pescetarian') >= 0) ? 'selected' : '';
    user.paleo = (user.diet.search('Paleo') >= 0) ? 'selected' : '';
    user.primal = (user.diet.search('Primal') >= 0) ? 'selected' : '';
    user.lowFODMAP = (user.diet.search('Low FODMAP') >= 0) ? 'selected' : '';
    user.whole30 = (user.diet.search('Whole30') >= 0) ? 'selected' : '';
}

module.exports = router;