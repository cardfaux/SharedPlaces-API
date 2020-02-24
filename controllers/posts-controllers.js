const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

// Bring In The Post Model
const Post = require('../models/post');
// Bring In The User Model
const User = require('../models/user');

let DUMMY_POSTS = [
	{
		id: 'a1',
		title: 'First Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u1'
	},
	{
		id: 'a2',
		title: 'Second Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u1'
	},
	{
		id: 'a3',
		title: 'Third Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u2'
	}
];

// @type -- GET
// @path -- /api/posts
// @desc -- path to get all the posts
const getAllPosts = (req, res, next) => {
	const posts = DUMMY_POSTS;

	if (posts.length === 0) {
		throw new HttpError('Could Not Find Any Posts', 404);
	}

	res.json({ posts: posts });
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

	const { title, post, creator } = req.body;

	// Instanciate Post Constructor

	const createdPost = new Post({
		title,
		post,
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
const updatePostById = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
	}

	const { title, post } = req.body;
	const postId = req.params.pid;

	const updatedPost = { ...DUMMY_POSTS.find((p) => p.id === postId) };
	const postIndex = DUMMY_POSTS.findIndex((p) => p.id === postId);

	updatedPost.title = title;
	updatedPost.post = post;

	DUMMY_POSTS[postIndex] = updatedPost;

	res.status(200).json({ post: updatedPost });
};

// @type -- Delete
// @path -- /api/posts/:pid
// @desc -- path to delete a post by the id
const deletePostById = (req, res, next) => {
	const postId = req.params.pid;
	if (!DUMMY_POSTS.find((p) => p.id === postId)) {
		throw new HttpError('Could Not Find A Place For That ID', 404);
	}
	DUMMY_POSTS = DUMMY_POSTS.filter((p) => p.id !== postId);
	res.status(200).json({ message: 'Deleted Post Successfully!' });
};

exports.getAllPosts = getAllPosts;
exports.getASinglePostById = getASinglePostById;
exports.getAllPostsByAUser = getAllPostsByAUser;
exports.createAPost = createAPost;
exports.updatePostById = updatePostById;
exports.deletePostById = deletePostById;
