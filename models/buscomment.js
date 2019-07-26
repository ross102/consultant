const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buscommentSchema = new Schema({
      author: {
	        	type: Schema.Types.ObjectId,
	        	ref: 'User'
	  },
      text: String,
      created: {
        type: Date, default: Date.now
    }
});



module.exports = mongoose.model('Buscomment', buscommentSchema);