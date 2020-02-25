const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

// Bring In The User Model
const User = require('../models/user');

// @type -- GET
// @path -- /api/users
// @desc -- path to get all the users
const getUsers = async (req, res, next) => {
	let users;

	try {
		users = await User.find({}, '-password');
	} catch (err) {
		const error = new HttpError('Fetching Users Failed', 500);
		return next(error);
	}

	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

// @type -- POST
// @path -- /api/users/signup
// @desc -- path to register a new user
const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Can Not Use throw Inside Of An Async Function
		//throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
		return next(
			new HttpError('Invalid Inputs Passed, Please Check Your Data', 422)
		);
	}

	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Signing Up Failed, Please Try Again', 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			'User Already Exists, Use A Different E-Mail Or Login Instead',
			422
		);
		return next(error);
	}

	// New Instance Of The User Class
	const createdUser = new User({
		name,
		email,
		image: req.file.path,
		password,
		places: [],
		posts: []
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			'Creating A User Failed, Please Try Again',
			500
		);
		return next(error);
	}
	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// @type -- POST
// @path -- /api/users/login
// @desc -- path to login a user
const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Logging In Failed, Please Try Again', 500);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError('Invalid Credentials', 401);
		return next(error);
	}

	res.json({
		message: 'Logged In!',
		user: existingUser.toObject({ getters: true })
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
