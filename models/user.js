const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: {
        type: String, required: true
     },
    email: {
        type: String, required: true
     },
    image:  {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
    },
    isAdmin: {
        type: Boolean, default: false
    },
    created: {
        type: Date, default: Date.now
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);