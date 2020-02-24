const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'Empire State Building',
		description: 'One Of The Most Famous Sky Scrappers In The World',
		location: {
			lat: 40.7484474,
			lng: -73.9871516
		},
		address: '20 W 34th St, New York, NY 10001',
		creator: 'u1'
	}
];

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
// @desc -- path to get a place by user id
const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let places;
	try {
		places = await Place.find({ creator: userId });
	} catch (err) {
		const error = new HttpError(
			'Fetching Places Failed, Please Try Again Later',
			500
		);
		return next(error);
	}

	// Could Be Refactored To Be InLine With The Rest Of The Code
	if (!places || places.length === 0) {
		return next(
			new HttpError('Could Not Find Places For The Provided User ID', 404)
		);
	}

	// Find Returns An Array So We Use Map and then toObject
	res.json({ place: places.map((place) => place.toObject({ getters: true })) });
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
		image: 'http://media1.santabanta.com/full1/Countries/Places/places-92a.jpg',
		creator
	});

	try {
		await createdPlace.save();
	} catch (err) {
		const error = new HttpError(
			'Creating A Plae Failed, Please Try Again',
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
		throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
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
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong Deleteing The Place',
			500
		);
		return next(error);
	}

	try {
		await place.remove();
	} catch (err) {
		const error = new HttpError(
			'Something Went Wrong Deleteing The Place',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: 'Deleted Place Successfully!' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
