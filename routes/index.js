const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const PostBus = require('../models/postBus');
const { check, validationResult } = require('express-validator/check');
const { validateUser } = require('../middleware');
const request = require('request');
const passport = require('passport');

router.get('/', async (req, res) => {
	const posts = await Post.find({}).sort({ _id: -1 }).limit(10).populate('author');
	const postBus = await PostBus.find({}).sort({ _id: -1 }).limit(10).populate('author');
	// number of comments
	// const commentNos = posts.comments.length
	res.render('index', { posts, postBus });
});

// register route
router.get('/register', (req, res) => {
	res.render('user/register', { username: '', email: '' });
});

// register route/ POST
router.post('/register', async (req, res) => {
	// pass error messages
	if (req.body.username.length < 4 || req.body.password.length < 4) {
		//	render the form with input fields filled
		res.render('user/register', {
			username: req.body.username,
			email: req.body.email,
			error: 'please username and password should be more than four characters'
		});
	} else {
		// Check if email already exists in db
		const foundEmail = await User.findOne({ email: req.body.email });
		if (foundEmail.length > 1) {
			res.render('user/register', {
				username: req.body.username,
				email: req.body.email,
				error: 'Email already exists'
			});
		}
		// Check if username already exists in db
		const foundUser = await User.findOne({ username: req.body.username });
		if (foundUser.length > 1) {
			res.render('user/register', {
				username: req.body.username,
				email: req.body.email,
				error: 'User already exists'
			});
		}
		// set Admin
		if (req.body.password === process.env.Admin) {
			req.body.isAdmin = true;
		}
		console.log(req.body);
		// verify with google captcha
		if (req.body === undefined || req.body === '' || req.body === null) {
			req.flash('error', 'please ensure that the fields are not empty');
		} else {
			request.post(
				'https://www.google.com/recaptcha/api/siteverify',
				{
					headers: {
						'content-type': 'application/json'
					},
					form: {
						secret: process.env.GOOGLE_KEY,
						response: req.body
					}
				},
				function(error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log(body);
					}
				}
			);
		}

		// register and login user
		User.register(req.body, req.body.password, function(err, user) {
			if (err) {
				console.log(err);
				return res.render('user/register', {
					username: req.body.username,
					email: req.body.email,
					error: err.message
				});
			} else {
				passport.authenticate('local')(req, res, function() {
					req.flash('success', 'Welcome, nice to meet you ' + user.username);
					res.redirect('/');
				});
			}
		});
	}
});

// login route
router.get('/login', (req, res) => {
	// check if user is already logged in before rendering login form
	if (req.isAuthenticated()) {
		req.flash('error', 'You are already logged in');
		return res.redirect('/');
	}
	res.render('user/login');
});

// login route/ POST
router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: true
	}),
	function(req, res) {
		req.flash('success', 'You are Logged in. Welcome back');
		return res.redirect('/');
	}
);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
	req.flash('success', 'logged you out');
});

module.exports = router;
