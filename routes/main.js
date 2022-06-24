const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Promotion = require('../models/Promotion');
const User = require('../models/User');

const bcrypt = require('bcryptjs'); // for password encryption

const moment = require('moment');

router.get('/', (req, res) => {
	
	User.findOne({ where: { role: 'admin' } })
		.then((Admin) => {
			if (!Admin) {
				let password = 'password';
				// Generate salt hashed password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(password, salt, (err, hash) => {
						if (err) throw err;
						password = hash;
						
						User.create({
							name: 'Admin 1',
							email: 'appdevproject9@gmail.com',
							password,
							role: 'admin',
							verified: 1,
						})
					})
				})
			}
		})

	if (req.user.id) {
		return res.render('user/profile')
	}
	const title = 'Video Jotter';
	res.redirect('http://localhost:3000/')
});

// User Login Route
router.get('/showLogin', (req, res) => {
	res.render('user/login');	// Activates views/user/login.handlebar
});

// shows the register page
router.get('/showRegister', (req, res) => {
	res.render('user/register'); 	// Activates views/user/register.handlebar
});

let error = 'Error msg using error!!!';
let errors = [{ text: 'First error msg using errors' }, { text: 'Second error msg using errors' }, { text: 'Third error msg using errors' }];

// shows the about page
router.get('/about', (req, res) => {
	const author = 'Robert Lim';

	alertMessage(res, 'success', 'This is an important message', 'fas fa-sign-in-alt', true);
	alertMessage(res, 'danger', 'Unauthorised access', 'fas fa-exclamation-circle', false);

	let success_msg = 'Success message using success_msg!!';
	let error_msg = 'Error message using error_msg!!';

	res.render('about', {	// Activates views/about.handlebar, passing author as a variable
		success_msg: success_msg,
		error_msg: error_msg,
		error: error,
		errors: errors,
		author: author
	});
});

// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});





module.exports = router;
