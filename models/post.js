const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	name: { type: String },
	avatar: { type: String },
	date: { type: Date, required: true, default: Date.now },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Post', postSchema);
