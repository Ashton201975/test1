const express = require('express');
const router = express.Router();
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const bcrypt = require('bcryptjs'); // for password encryption


// User register URL using HTTP post => /user/register
// router.post('/register', (req, res) => {
//     // req.body.password // Retrieves password input
//     // req.body.password2 // Retrieves password2 input
//     // req.body.email // Retrieves email input

//     let errors = [];

//     // check if both passwords entered are the same
//     if (req.body.password !== req.body.password2) {
//         errors.push({text:'Passwords do not match'});
//     }

//     // Checks if password length is more than 4
//     if (req.body.password.length < 4) {
//         errors.push({text: 'Password must be at least 4 characters'})
//     }

//     /* 
//      If there is any error with password mismatch or size , then there must be
//      more than one error message in the errors array, hence its length must be more than one.
//      In that case, render register.handlebars with error messages.
//     */
//     if (errors.length > 0) {
//         res.render('user/register', {
//             errors: errors,
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password,
//             password2: req.body.password2
//         });
//     } else {
//         let success_msg = `${req.body.email} registered successfully`;
//         res.render('user/login', {
//             success_msg: success_msg
//         });
//     }

// });

router.post('/register', (req, res) => {
    let errors = [];

    // Retrieves fields from register page from request body
    let { name, email, password, password2 } = req.body;

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
            email,
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
                        email,
                        password,
                        password2
                    });
                } else {
                    // Gemerate salt hashed password
                    bcrypt.genSalt(10,(err, salt) =>{
                        bcrypt.hash(password, salt, (err,hash) =>{
                            if (err) throw err;
                            password = hash;
                            
                            // Create new user record
                            User.create({ name, email, password })
                                .then(user => {
                                    alertMessage(res, 'success', user.name + ' added. Please login', 'fas fa-sign-in-alt', true);
                                    res.redirect('/showLogin');
                                })
                                .catch(err => console.log(err));
                        })
                        

                    })

                    
                }
            });
    }

});

const passport = require('passport');
// Login Form POST => /user/login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/video/listVideos', // Route to /video/listVideos URL
        failureRedirect: '/showLogin', // Route to /login URL
        failureFlash: true
        /* Setting the failureFlash option to true instructs Passport to flash an error message using the message given by
       the strategy's verify callback, if any. When a failure occur, passport passes the message object as error */
    })(req, res, next);
});

module.exports = router;