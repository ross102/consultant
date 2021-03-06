const express = require('express');
const router = express.Router();
const Mail = require('../models/sendEmail');
const { isLoggedIn } = require('../middleware');
const nodemailer = require('nodemailer');

// //  subscribe/new form
router.get('/', (req, res) => {
	res.redirect('/');
});
// subscribe/sendmail
router.get('/sendmail', isLoggedIn, (req, res) => {
	res.render('sendmail');
});

// subscribe
router.post('/', async (req, res) => {
	if (req.body.email === '') {
		req.flash('errror', 'email should not be empty');
	} else {
		try {
			await Mail.create({ email: req.body.email });
			req.flash('success', 'Email subscription successful');
			res.redirect('/');
		} catch (error) {
			req.flash('error', 'unable to subscribe now');
			res.redirect('/');
			console.log(error);
		}
	}
});

router.post('/sendmail', isLoggedIn, async (req, res) => {
	const mails = await Mail.find({});
	const mailList = [];

	for (const i of mails) {
		mailList.push(i.email);
	}
	console.log(mailList);
	try {
		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.GMAIL,
				pass: process.env.PASS
			}
		});
		// send mail with defined transport object

		let mailOptions = {
			from: 'nduross1@gmail.com', // sender address
			to: mailList, // list of receivers
			subject: req.body.subject, // Subject line
			text: req.body.body, // plain text body
			html: '<b>Hello node mailer test</b> ' + req.body.body // html body
		};

		const msg = await transporter.sendMail(mailOptions);
		console.log('Message %s sent: %s', msg.messageId, msg.response);
		req.flash('success', 'successfully sent');
		res.redirect('/');
	} catch (error) {
		return console.log(error);
	}
});

module.exports = router;
