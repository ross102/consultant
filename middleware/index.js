const User = require('../models/user');
const Post = require('../models/post');
const { cloudinary } = require('../cloudinary');
const { check, validationResult } = require('express-validator/check');

const middleware = {
	validateUser: [
		check('username')
			.isLength({ min: 3 })
			.withMessage(' username should be at least three alphabets')
			.trim()
			.escape(),
		check('email').isEmail().withMessage('email is invalid').trim().escape(),
		check('password')
			.isLength({ min: 5 })
			.withMessage(' passwords must be at least five characters')
			.trim()
			.escape()
	]
};

module.exports = middleware;
