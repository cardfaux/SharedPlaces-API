const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');

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
const getPlaceById = (req, res, next) => {
	const placeId = req.params.pid;

	const place = DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});

	if (!place) {
		throw new HttpError('Could Not Find A Place For The Provided ID', 404);
	}

	res.json({ place: place });
};

// @type -- GET
// @path -- /api/places/user/:uid
// @desc -- path to get a place by user id
const getPlacesByUserId = (req, res, next) => {
	const userId = req.params.uid;

	const places = DUMMY_PLACES.filter((p) => {
		return p.creator === userId;
	});

	if (!places || places.length === 0) {
		return next(
			new HttpError('Could Not Find Places For The Provided User ID', 404)
		);
	}

	res.json({ place: places });
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

	const createdPlace = {
		id: uuid(),
		title: title,
		description: description,
		location: coordinates,
		address: address,
		creator: creator
	};

	DUMMY_PLACES.push(createdPlace);

	res.status(201).json({ place: createdPlace });
};

// @type -- PATCH
// @path -- /api/places/:pid
// @desc -- path to update a place by the id
const updatePlaceById = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid Inputs Passed, Please Check Your Data', 422);
	}

	const { title, description } = req.body;
	const placeId = req.params.pid;

	const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
	const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: updatedPlace });
};

// @type -- DELETE
// @path -- /api/places/:pid
// @desc -- path to delete a place by the id
const deletePlaceById = (req, res, next) => {
	const placeId = req.params.pid;
	if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
		throw new HttpError('Could Not Find A Place For That ID', 404);
	}
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
	res.status(200).json({ message: 'Deleted Place Successfully!' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
