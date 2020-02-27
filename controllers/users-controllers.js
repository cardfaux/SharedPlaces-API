const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

	// Hash The Password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError('Could Not Create User, Please Try Again', 500);
		return next(error);
	}

	// New Instance Of The User Class
	const createdUser = new User({
		name,
		email,
		image: req.file.path,
		password: hashedPassword,
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

	let token;
	try {
		token = jwt.sign(
			{
				userId: createdUser.id,
				email: createdUser.email,
				userName: createdUser.name
			},
			'supsecret213_dont321_tell123',
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Creating A User Failed, Please Try Again',
			500
		);
		return next(error);
	}

	res.status(201).json({
		userId: createdUser.id,
		email: createdUser.email,
		userName: createdUser.name,
		token: token
	});
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

	if (!existingUser) {
		const error = new HttpError('Invalid Credentials', 403);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		const error = new HttpError(
			'Logging In Failed, Please Check Your Credentials And Try Again',
			500
		);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError(
			'Logging In Failed, Please Check Your Credentials And Try Again',
			500
		);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: existingUser.id,
				email: existingUser.email,
				userName: existingUser.name
			},
			'supsecret213_dont321_tell123',
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError('Logging In Failed, Please Try Again', 500);
		return next(error);
	}

	res.json({
		userId: existingUser.id,
		email: existingUser.email,
		userName: existingUser.name,
		token: token
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
