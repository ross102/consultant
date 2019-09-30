const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isLoggedIn } = require('../middleware');
const PostBus = require('../models/postBus');
const { cloudinary, storage } = require('../cloudinary');
const upload = multer({ storage });

//  postbus/new route
router.get('/new', isLoggedIn, (req, res) => {
	res.render('postbus/postbusForm');
});

//postbus/ route
router.get('/', async (req, res) => {
	try {
		const posts = await PostBus.paginate(
			{},
			{
				page: req.query.page || 1,
				limit: 10,
				sort: '-_id'
			}
		);
		posts.page = Number(posts.page);
		res.render('postbus/allBusPost', { posts });
	} catch (error) {
		res.status(400).send('something went wrong');
		console.log(error);
	}
});

// postbus/ route
router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
	try {
		if (req.file) {
			const { secure_url, public_id } = req.file;
			req.body.post.image = { secure_url, public_id };
		}
		req.body.post.author = req.user._id;
		await PostBus.create(req.body.post);
		req.flash('success', ' post Successful');
		res.redirect('/');
	} catch (error) {
		res.render('postbus/postBusForm', {
			title: req.body.post.title,
			desc: req.body.post.desc,
			error: 'Post Not successful'
		});
		console.log(error);
	}
});
// Show route/ postbus/id
router.get('/:id', async (req, res) => {
	try {
		let post = await PostBus.findById(req.params.id)
			.populate({
				path: 'comments',
				populate: {
					path: 'author',
					model: 'User'
				}
			})
			.populate('author');
		console.log(post);
		res.render('postbus/show', { post });
	} catch (error) {
		res.status(400).send('something went wrong');
		console.log(error);
	}
});
// Edit route/ postbus/id/edit
router.get('/:id/edit', isLoggedIn, async (req, res) => {
	try {
		let post = await PostBus.findById(req.params.id);
		res.render('postbus/edit', { post });
	} catch (error) {
		console.log(error);
	}
});

//Update route/ postbus/id
router.put('/:id', isLoggedIn, upload.single('image'), async (req, res) => {
	try {
		let post = await PostBus.findById(req.params.id);
		if (req.file) {
			if (post.image.public_id) {
				await cloudinary.v2.uploader.destroy(post.image.public_id);
				const { secure_url, public_id } = req.file;
				req.body.post.image = { secure_url, public_id };
			}

			post.image = req.body.post.image;

			// save post to database
			post.title = req.body.post.title;
			post.desc = req.body.post.desc;
			await post.save();
			req.flash('success', ' update successful');
			// redirect to show page
			res.redirect(`/post/${post.id}`);
		}
	} catch (error) {
		console.log(error);
	}
});

// Delete route
router.delete('/:id', isLoggedIn, async (req, res) => {
	try {
		let post = await PostBus.findById(req.params.id);
		if (post.image.public_id) {
			let public_id = post.image.public_id;
			await cloudinary.v2.uploader.destroy(public_id);
			await post.remove();
			req.flash('success', 'deleted');
			res.redirect('/');
		}
		await post.remove();
		req.flash('success', 'deleted');
		res.redirect('/');
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
