const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

// Bring In The Post Model
const Post = require('../models/post');
// Bring In The User Model
const User = require('../models/user');

// @type -- GET
// @path -- /api/posts
// @desc -- path to get all the posts
const getAllPosts = async (req, res, next) => {
	let posts;

	try {
		posts = await Post.find({});
	} catch (err) {
		const error = new HttpError('Fetching Posts Failed', 500);
		return next(error);
	}

	res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

// @type -- GET
// @path -- /api/posts/:pid
// @desc -- path to get a single posts by id
const getASinglePostById = async (req, res, next) => {
	const postId = req.params.pid;

	let post;
	try {
		post = await Post.findById(postId);
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Find Post',
			500
		);
		return next(error);
	}

	if (!post || post.length === 0) {
		const error = new HttpError(
			'Could Not Find A Post For The Provided ID',
			404
		);
		return next(error);
	}

	// Turns The Place Object Into A Normal JavaScript Object
	// Getters: True Turns The Mongoose Model _id to id
	res.json({ post: post.toObject({ getters: true }) });
};

// @type -- GET
// @path -- /api/posts/user/:uid
// @desc -- path to get posts created by a user
const getAllPostsByAUser = async (req, res, next) => {
	const userId = req.params.uid;

	let userWithPosts;
	try {
		userWithPosts = await User.findById(userId).populate('posts');
	} catch (err) {
		const error = new HttpError(
			'Fetching Posts Failed, Please Try Again Later',
			500
		);
		return next(error);
	}

	if (!userWithPosts || userWithPosts.posts.length === 0) {
		return next(
			new HttpError('Could Not Find Posts For The Provided User ID', 404)
		);
	}

	res.json({
		post: userWithPosts.posts.map((post) => post.toObject({ getters: true }))
	});
};

// @type -- POST
// @path -- /api/posts
// @desc -- path to create a post
const createAPost = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError('Invalid Inputs Passed, Please Check Your Data', 422)
		);
	}

	const { title, description, creator } = req.body;

	// Instanciate Post Constructor
	const createdPost = new Post({
		title,
		description,
		creator
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(
			'Creating A New Post Failed, Please Try Again',
			500
		);
		return next(error);
	}

	// Make Sure The User Isn't Already In The Database
	if (!user) {
		const error = new HttpError('Could Not Find A User For Provided Id', 404);
		return next(error);
	}

	console.log(user);

	try {
		// Current Session
		const sess = await mongoose.startSession();
		// Start Transaction In The Current Session
		sess.startTransaction();
		// Tell Mongoose Whst To Do
		// Create Our Place And Create An Unique Id
		await createdPost.save({ session: sess });
		// Add The Post Id To Our User As Well
		// This Push Is Not The Standard Push, Allows Mongoose To Establish A Connection Between The Models
		// Adds The PostId To The Places Field Of The User
		user.posts.push(createdPost);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Creating A Post Failed, Please Try Again',
			500
		);
		return next(error);
	}

	res.status(201).json({ post: createdPost });
};

// @type -- PATCH
// @path -- /api/posts/:pid
// @desc -- path to update a post by the id
const updatePostById = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Can not Use Throw Inside Of An Async Function
		//throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
		return next(
			new HttpError('Invalid Inputs Passed, Please Check Your Data', 422)
		);
	}

	const { title, description } = req.body;
	const postId = req.params.pid;

	let post;
	try {
		post = await Post.findById(postId);
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Update Post',
			500
		);
		return next(error);
	}

	post.title = title;
	post.description = description;

	try {
		await post.save();
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Save The Updated Post',
			500
		);
		return next(error);
	}

	res.status(200).json({ post: post.toObject({ getters: true }) });
};

// @type -- Delete
// @path -- /api/posts/:pid
// @desc -- path to delete a post by the id
const deletePostById = async (req, res, next) => {
	const postId = req.params.pid;
	let post;

	try {
		post = await Post.findById(postId).populate('creator');
	} catch (err) {
		const error = new HttpError('Something Went Wrong Deleteing The Post', 500);
		return next(error);
	}

	if (!post) {
		const error = new HttpError('Could Not Find A Post For The Id', 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await post.remove({ session: sess });
		// Pull Will Automatically Remove The Id
		post.creator.posts.pull(post);
		await post.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError('Something Went Wrong Deleteing The Post', 500);
		return next(error);
	}

	res.status(200).json({ message: 'Deleted Post Successfully!' });
};

exports.getAllPosts = getAllPosts;
exports.getASinglePostById = getASinglePostById;
exports.getAllPostsByAUser = getAllPostsByAUser;
exports.createAPost = createAPost;
exports.updatePostById = updatePostById;
exports.deletePostById = deletePostById;
