const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Promotion = require('../models/Promotion');
const User = require('../models/User');
const schedule = require('node-schedule');
const voucher_codes = require('voucher-code-generator');


const moment = require('moment');

// Assignment Test Codes

schedule.scheduleJob({hour: 00, minute: 01}, () => {

	console.log("DOg sofjpihugdkhjbfnjkleiwrhugdfbskleiforuhkgjbsfkihbgdskuhbsfekhbvdfnm")

	const dateCheck = (from, to, check) => {
		let fDate, lDate, cDate;
		fDate = Date.parse(from);
		lDate = Date.parse(to);
		cDate = Date.parse(check);
		if ((cDate <= lDate && cDate >= fDate)) return true
		return false;
	}
	// console.log(dateCheck("02/05/2021", "02/09/2021", "02/01/2021"));

	Promotion.findAll({

	})
		.then((promotion) => {

			if (promotion) {

				const today = new Date();

				for (let i = 0; i < promotion.length; i++) {

					if (dateCheck(promotion[i].StartOfPromotion, promotion[i].EndOfPromotion, today)) {

						if (promotion[i].ValidPromo == "FALSE") {
							const ValidPromo = "TRUE";

							Promotion.update({
								ValidPromo
							}, {
								where: {
									id: promotion[i].id
								}
							}).then((promotion) => {

							}).catch(err => console.log(err))
						}

					} else if (promotion[i].ValidPromo == "TRUE") {

						const ValidPromo = "FALSE";

						Promotion.update({
							ValidPromo
						}, {
							where: {
								id: promotion[i].id
							}
						}).then((promotion) => {

						}).catch(err => console.log(err))
					}
					else {

					}

				}

			}

		})
}) // run everyday at midnight

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

router.get('/test', (req, res) => {
	res.render('promotion/test');
});

router.get('/CreatePromotion', (req, res) => {

	const today = new Date();
	let tommorow = new Date(today);
	let endDate = new Date(today);
	tommorow.setDate(tommorow.getDate() + 0);
	endDate.setDate(endDate.getDate() + 2);

	tommorow = formatDate(tommorow);
	endDate = formatDate(endDate);

	User.findAll()
		.then(user => {
			res.render('promotion/CreatePromotion', {
				defaultStartDate: tommorow,
				endDate: endDate,
				user: user
			});
		})

	
});

function generateCode() {
	const code = voucher_codes.generate({
		length: 8,
		count: 1,
		charset: voucher_codes.charset("alphanumeric")
	});

	return code[0]
}

router.post('/generateCode', (req, res) => {

	let code;
	
	while (true) {
		code = generateCode();
		let checker = true;
		Promotion.findOne({where: { PromotionCode: code}})
			.then(promotion => {
				if (promotion) {
					checker = false;
				}
			});
		
		if  (checker) {
			break
		}
	};

	res.send({response: code});
	
});


router.post('/createPromotions', (req, res) => {

	let { PromotionName, EmailLimit, PromotionAmount, RedemptionPerPerson, TotalRedemption, PromotionCode, Purpose, StartOfPromotion, EndOfPromotion } = req.body;

	ValidPromo = 'FALSE';

	Promotion.findOne({ where: { PromotionCode: PromotionCode } })
		.then(promotion => {
			if (promotion) {
				const endDate = req.body.EndOfPromotion;
				const defaultStartDate = req.body.StartOfPromotion;

				res.render('promotion/CreatePromotion', {
					error: promotion.PromotionCode + ' already registered',
					...req.body,
					endDate,
					defaultStartDate
				})
			}
			else {

				Promotion.create({ PromotionName, EmailLimit, RedemptionPerPerson, TotalRedemption, PromotionAmount, PromotionCode, Purpose, StartOfPromotion, EndOfPromotion, ValidPromo })
					.then(promotion => {
						alertMessage(res, 'success', promotion.PromotionName, 'fas fa-sign-in-alt', true);
						res.redirect('/promotion/checkValidity')
					})

			}
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
			res.render('promotion/listPromotion', {
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
		console.log(promotion)

		const startDate = formatDate(promotion.StartOfPromotion)
		const endDate = formatDate(promotion.EndOfPromotion)

		res.render('promotion/editPromotion', {
			promotion,
			startDate: startDate,
			endDate: endDate
		});
	}).catch(err => console.log(err));
});

router.put('/saveEditedPromotion/:id', (req, res) => {

	let Purpose = req.body.Purpose.slice(0, 1999);


	Promotion.update({
		...req.body,
		Purpose,
	}, {
		where: {
			id: req.params.id
		}
	}).then((promotion) => {
		res.redirect('/promotion/listPromotion')
	}).catch(err => console.log(err))

});

router.get('/deletePromotion/:id', (req, res) => {
	Promotion.findOne({
		where: {
			id: req.params.id
		}
	}).then((promotion) => {
		let promotionName = promotion.PromotionName // to store the video title to display in success message
		// Only authorised user who is owner of video can delete it

		Promotion.destroy({ //delete the video
			where: {
				id: req.params.id
			}
		}).then(() => { //Re-direct to the video list page with the appropriate success message
			alertMessage(res, 'success', promotionName + ' promotion deleted', 'far fa-trash-alt', true);
			res.redirect('/promotion/listPromotion');
		})

	}).catch(err => console.log(err)); // To catch no video ID
});

router.get('/checkValidity', (req, res) => {

	const dateCheck = (from, to, check) => {
		let fDate, lDate, cDate;
		fDate = Date.parse(from);
		lDate = Date.parse(to);
		cDate = Date.parse(check);
		if ((cDate <= lDate && cDate >= fDate)) return true
		return false;
	}
	// console.log(dateCheck("02/05/2021", "02/09/2021", "02/01/2021"));

	Promotion.findAll({

	})
		.then((promotion) => {

			if (promotion) {

				const today = new Date();

				for (let i = 0; i < promotion.length; i++) {

					if (dateCheck(promotion[i].StartOfPromotion, promotion[i].EndOfPromotion, today)) {

						if (promotion[i].ValidPromo == "FALSE") {
							const ValidPromo = "TRUE";

							Promotion.update({
								ValidPromo
							}, {
								where: {
									id: promotion[i].id
								}
							}).then((promotion) => {

							}).catch(err => console.log(err))
						}

					} else if (promotion[i].ValidPromo == "TRUE") {

						const ValidPromo = "FALSE";

						Promotion.update({
							ValidPromo
						}, {
							where: {
								id: promotion[i].id
							}
						}).then((promotion) => {

						}).catch(err => console.log(err))
					}
					else {

					}

				}

			}

		})

	res.redirect('/promotion/listPromotion')
});

module.exports = router;