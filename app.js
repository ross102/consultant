if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');

const indexRouter = require('./routes');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comments');
const postPdfRouter = require('./routes/postPdf');
const postBusRouter = require('./routes/postBus');
const buscommentRouter = require('./routes/buscomments');
const paymentRouter = require('./routes/payment');
const mailRouter = require('./routes/mail');

const app = express();

//connect to database

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useCreateIndex: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoDb connection error'));

//use ejs-template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// static files
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Configure Passport and Sessions
app.use(
	session({
		secret: 'lions are scary',
		resave: false,
		saveUninitialized: true
	})
);
// for flash messages
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.title = 'fred';
	// set flash message
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');

	next();
});

// Mount routes
app.use('/', indexRouter);
app.use('/post', postRouter);
app.use('/post/:id/comments', commentRouter);
app.use('/postPdf', postPdfRouter);
app.use('/postBus', postBusRouter);
app.use('/postBus/:id/comments', buscommentRouter);
app.use('/paystack', paymentRouter);
app.use('/subscribe', mailRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('You are connected');
});

module.exports = app;
