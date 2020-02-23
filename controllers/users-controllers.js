const { validationResult } = require('express-validator');
const uuid = require('uuid/v4');

const HttpError = require('../models/http-error');

const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'James Hagood',
		email: 'test@test.com',
		password: 'testers'
	}
];

// @type -- GET
// @path -- /api/users
// @desc -- path to get all the users
const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

// @type -- POST
// @path -- /api/users/signup
// @desc -- path to register a new user
const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
	}

	const { name, email, password } = req.body;

	const hasUser = DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError('Could Not Create User, E-Mail Already Exists', 422);
	}

	const createdUser = {
		id: uuid(),
		name: name,
		email: email,
		password: password
	};
	DUMMY_USERS.push(createdUser);
	res.status(201).json({ user: createdUser });
};

// @type -- POST
// @path -- /api/users/login
// @desc -- path to login a user
const login = (req, res, next) => {
	const { email, password } = req.body;

	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError(
			'Could Not Identify User, Credentials Could Be Wrong',
			401
		);
	}

	res.json({ message: 'Logged In!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
