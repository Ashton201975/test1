const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Promotion = require('../models/Promotion');

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	res.render('index', { title: title }) // renders views/index.handlebars
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

router.get('/test', (req, res) => {
	res.render('test');
});

// Assignment Test Codes

router.get('/CreatePromotion', (req, res) => {

	res.render('CreatePromotion');
});

router.post('/createPromotions', (req, res) => {
	
	let errors = [];
	
	let { PromotionName, EmailLimit, PromotionAmount, RedemptionPerPerson, TotalRedemption, PromotionCode, Purpose, StartOfPromotion, EndOfPromotion } = req.body;

	if (PromotionName.length < 30) {
		errors.push({text: "Promotion Name is Too Longgggggggggggggggggggggggggggg"})
	}

	if (PromotionCode.length > 2 && PromotionCode.length < 7) {
		errors.push({text: "Promotion Code must be 3-6 letters only"})
	}

	ValidPromo = 'TRUE';

	Promotion.create({ PromotionName, EmailLimit, RedemptionPerPerson, TotalRedemption, PromotionAmount, PromotionCode, Purpose, StartOfPromotion, EndOfPromotion, ValidPromo })
		.then(promotion => {
			alertMessage(res, 'success', promotion.PromotionName, 'fas fa-sign-in-alt', true);
			res.redirect('/test')
		})
});

router.get('/listPromotion', (req, res) => {
	Promotion.findAll({
		order: [
			['id', 'ASC']
		],
		raw: true
	})
		.then((promotion) => {
			// pass object to listVideos.handlebar
			res.render('listPromotion', {
				promotion: promotion
			});
		})
		.catch(err => console.log(err));
});

router.get('/updatePromotions/:id', (req, res) => {

	Promotion.findOne({
        where: {
            id: req.params.id
        }
    }).then((promotion) => {
		res.render('editPromotion',{
			promotion
		})
	})
});

const moment = require('moment');

router.put('/saveEditedPromotion/:id', (req,res) =>{
    
	let Purpose = req.body.Purpose.slice(0,1999);
	let StartOfPromotion = moment(req.body.StartOfPromotion, 'DD/MM/YYYY')
	let EndOfPromotion = moment(req.body.EndOfPromotion, 'DD/MM/YYYY')

    Promotion.update({
		...req.body,
		Purpose,
		StartOfPromotion,
		EndOfPromotion
    }, {
        where: {
            id: req.params.id
        }
    }).then((promotion) => {
        res.redirect('/listPromotion')
    }).catch(err => console.log(err))
});


module.exports = router;
