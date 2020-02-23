const express = require('express');

const usersControllers = require('../controllers/users-controllers');

const router = express.Router();

// -----------------Users Routes Starts-----------------------------
router.get('/', usersControllers.getUsers);

router.post('/signup', usersControllers.signup);

router.post('/login', usersControllers.login);
// ----------------Users Routes Ends----------------------------------

module.exports = router;
