const express = require('express');

const postsControllers = require('../controllers/posts-controllers');

const router = express.Router();

//-------------------------Posts Routes Starts------------------------
router.get('/', postsControllers.getAllPosts);

module.exports = router;
