const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/post');
const { isLoggedIn } = require('../middleware');
const { cloudinary, storage } = require('../cloudinary');
const upload = multer({ storage });

//  Post/new route
router.get('/new', isLoggedIn, (req, res) => {
	res.render('postForm', { title: '', body: '' });
});

//Post/ route
router.get('/', async (req, res) => {
	try {
		const posts = await Post.paginate(
			{},
			{
				page: req.query.page || 1,
				limit: 10,
				sort: '-_id'
			}
		);
		posts.page = Number(posts.page);
		res.render('allPost', { posts });
	} catch (error) {
		res.status(400).send('something went wrong');
		console.log(error);
	}
});

// Post/ route
router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
	try {
		if (req.file) {
			const { secure_url, public_id } = req.file;
			req.body.post.image = { secure_url, public_id };
		}
		req.body.post.author = req.user._id;
		await Post.create(req.body.post);
		req.flash('success', 'post created');
		res.redirect('/');
	} catch (error) {
		res.render('postForm', {
			title: req.body.post.title,
			desc: req.body.post.desc,
			error: 'Post Not successful'
		});
		console.log(error);
	}
});
// Show route/ post/id
router.get('/:id', async (req, res) => {
	try {
		let post = await Post.findById(req.params.id)
			.populate({
				path: 'comments',
				populate: {
					path: 'author',
					model: 'User'
				}
			})
			.populate('author');
		res.render('show', { post });
	} catch (error) {
		res.status(400).send('something went wrong');
		console.log(error);
	}
});
// Edit route/ post/id/edit
router.get('/:id/edit', isLoggedIn, async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		res.render('edit', { post });
	} catch (error) {
		console.log(error);
	}
});

//Update route/ post/id
router.put('/:id', isLoggedIn, upload.single('image'), async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		if (req.file) {
			if (post.image.public_id) {
				await cloudinary.v2.uploader.destroy(post.image.public_id);
				post.image = null;
			}
			const { secure_url, public_id } = req.file;
			post.image = { secure_url, public_id };

			// save post to database
			post.title = req.body.post.title;
			post.desc = req.body.post.desc;
			await post.save();
			req.flash('success', 'update successful');
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
		let post = await Post.findById(req.params.id);
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
