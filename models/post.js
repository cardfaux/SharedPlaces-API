const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: { type: String, required: true },
	post: { type: String, required: true },
	date: { type: Date, default: Date.now },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Post', postSchema);
