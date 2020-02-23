const uuid = require('uuid/v4');

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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
const getPlaceByUserId = (req, res, next) => {
	const userId = req.params.uid;

	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});

	if (!place) {
		return next(
			new HttpError('Could Not Find A Place For The Provided User ID', 404)
		);
	}

	res.json({ place: place });
};

// @type -- POST
// @path -- /api/places
// @desc -- path to create a place
const createPlace = (req, res, next) => {
	const { title, description, coordinates, address, creator } = req.body;

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
const updatePlaceById = (req, res, next) => {};

// @type -- DELETE
// @path -- /api/places/:pid
// @desc -- path to delete a place by the id
const deletePlaceById = (req, res, next) => {};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
