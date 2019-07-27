const User = require('../models/user');
const Post = require('../models/post');
const { cloudinary } = require('../cloudinary');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

const middleware = {
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash('error', "sorry, you can't do that. Please login");
		res.redirect('/');
	}
};

module.exports = middleware;
