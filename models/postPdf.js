const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const PostPdfSchema = new Schema({
	title: String,
	pubUrl: String,
	author:  {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	created: { type: Date, default: Date.now }
});

PostPdfSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PostPdf', PostPdfSchema);