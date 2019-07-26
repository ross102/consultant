const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const PostSchema = new Schema({
	title: String,
	desc: String,
	image: {
		secure_url: { type: String, default: '/images/img1.jpg' },
		public_id: String
	},
	author:  {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	comments: [ {
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	created: { type: Date, default: Date.now }
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', PostSchema);
