const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');

// Bringing In The Place Model
const Place = require('../models/place');
// Bring In The User Model To Establish A Connection Between The Two
const User = require('../models/user');

// @type -- GET
// @path -- /api/places/:pid
// @desc -- path to get a place by it's id
const getPlaceById = async (req, res, next) => {
	const placeId = req.params.pid;

	// FindById Is A Mongoose Static Method
	// FindById Does Not Return A Real Promise
	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Find A Place',
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError(
			'Could Not Find A Place For The Provided ID',
			404
		);
		return next(error);
	}

	// Turns The Place Object Into A Normal JavaScript Object
	// Getters: True Turns The Mongoose Model _id to id
	res.json({ place: place.toObject({ getters: true }) });
};

// @type -- GET
// @path -- /api/places/user/:uid
// @desc -- path to get a places by user id
const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	//let places;
	let userWithPlaces;
	try {
		userWithPlaces = await User.findById(userId).populate('places');
	} catch (err) {
		const error = new HttpError(
			'Fetching Places Failed, Please Try Again Later',
			500
		);
		return next(error);
	}

	// Could Be Refactored To Be InLine With The Rest Of The Code
	if (!userWithPlaces || userWithPlaces.places.length === 0) {
		return next(
			new HttpError('Could Not Find Places For The Provided User ID', 404)
		);
	}

	// Find Returns An Array So We Use Map and then toObject
	res.json({
		places: userWithPlaces.places.map((place) =>
			place.toObject({ getters: true })
		)
	});
};

// @type -- POST
// @path -- /api/places
// @desc -- path to create a place
const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError('Invalid Inputs Passed, Please Check Your Data', 422)
		);
	}
	const { title, description, address, creator } = req.body;

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	// Instanciate Place Constructor
	const createdPlace = new Place({
		title,
		description,
		address,
		location: coordinates,
		image: req.file.path,
		creator
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(
			'Creating A New Place Failed, Please Try Again',
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
		await createdPlace.save({ session: sess });
		// Add The Place Id To Our User As Well
		// This Push Is Not The Standard Push, Allows Mongoose To Establish A Connection Between The @ Models
		// Adds The PlaceId To The Places Field Of The User
		user.places.push(createdPlace);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Creating A Place Failed, Please Try Again',
			500
		);
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

// @type -- PATCH
// @path -- /api/places/:pid
// @desc -- path to update a place by the id
const updatePlaceById = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Can not Use Throw Inside Of An Async Function
		//throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
		return next(
			new HttpError('Invalid Inputs Passed, Please Check Your Data', 422)
		);
	}

	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Update Place',
			500
		);
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong, Could Not Save The Updated Place',
			500
		);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

// @type -- DELETE
// @path -- /api/places/:pid
// @desc -- path to delete a place by the id
const deletePlaceById = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId).populate('creator');
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong Deleteing The Place',
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError('Could Not Find A Place For The Id', 404);
		return next(error);
	}

	const imagePath = place.image;

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({ session: sess });
		// Pull Will Automatically Remove The Id
		place.creator.places.pull(place);
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong Deleteing The Place',
			500
		);
		return next(error);
	}

	fs.unlink(imagePath, (err) => {
		console.log(err);
	});

	res.status(200).json({ message: 'Deleted Place Successfully!' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
