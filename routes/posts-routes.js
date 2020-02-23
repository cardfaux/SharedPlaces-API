const express = require('express');
const { check } = require('express-validator');

const postsControllers = require('../controllers/posts-controllers');

const router = express.Router();

//-------------------------Posts Routes Starts------------------------
router.get('/', postsControllers.getAllPosts);

router.get('/:pid', postsControllers.getASinglePostsById);

router.get('/user/:uid', postsControllers.getAllPostsByAUser);

router.post(
	'/',
	[
		check('title')
			.not()
			.isEmpty(),
		check('post').isLength({ min: 10 })
	],
	postsControllers.createAPost
);

module.exports = router;
