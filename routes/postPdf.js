const express = require('express');
const router = express.Router();
const multer = require('multer');
const PostPdf = require('../models/postPdf');
const { isLoggedIn } = require('../middleware');
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname + '-' + Date.now());
	}
});
const upload = multer({ storage: storage });

//  PostPdf/new route
router.get('/newPdf', isLoggedIn, (req, res) => {
	res.render('postPdf');
});

//PostPdf/ route
router.get('/', async (req, res) => {
	try {
		const pdfs = await PostPdf.paginate(
			{},
			{
				page: req.query.page || 1,
				limit: 10,
				sort: '-_id'
			}
		);
		res.render('allPdf', { pdfs });
	} catch (error) {
		res.status(400).send('something went wrong');
		console.log(error);
	}
});

// PostPdf/ route
router.post('/', isLoggedIn, upload.single('pdf'), async (req, res) => {
	if (!req.file) {
		res.render('postPdf', { title: req.body.title });
	}
	// validate file extension
	if (req.file.mimetype === 'application/pdf' || req.file.mimetype === 'application/docx') {
		try {
			await PostPdf.create({
				title: req.body.title,
				pubUrl: req.file.path,
				author: req.user._id
			});
			console.log(req.body);
			req.flash('success', 'Post created!');
			res.redirect('/');
		} catch (error) {
			res.render('postPdf', { error: 'sorry, something went wrong ' });
			console.log(error);
		}
	}
});
// Show route/ post/id
router.get('/:id/pdf', async (req, res) => {
	try {
		let post = await PostPdf.findById(req.params.id);
		res.download(post.pubUrl, post.title);
	} catch (error) {
		console.log(error);
	}
});

// Delete route
router.delete('/:id', isLoggedIn, async (req, res) => {
	try {
		let post = await PostPdf.findById(req.params.id);
		await post.remove();
		req.flash('success', 'deleted');
		res.redirect('/');
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
