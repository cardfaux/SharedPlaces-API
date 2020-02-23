const express = require('express');

const placesControllers = require('../controllers/places-controller');

const router = express.Router();

// -----------------Places Routes Starts-----------------------------
router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post('/', placesControllers.createPlace);

router.patch('/:pid', placesControllers.updatePlaceById);

router.delete('/:pid', placesControllers.deletePlaceById);
// ----------------Places Routes Ends----------------------------------

module.exports = router;
