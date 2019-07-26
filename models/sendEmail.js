const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SendMailSchema = Schema({
    email: String,
    created: {
      type: Date, default: Date.now
    }
})




module.exports = mongoose.model('Mail', SendMailSchema);