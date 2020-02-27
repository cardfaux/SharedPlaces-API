const express = require('express');
const { check } = require('express-validator');

const postsControllers = require('../controllers/posts-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

//-------------------------Posts Routes Starts------------------------
router.get('/', postsControllers.getAllPosts);

router.get('/:pid', postsControllers.getASinglePostById);

router.get('/user/:uid', postsControllers.getAllPostsByAUser);

router.use(checkAuth);

router.post(
	'/',
	[
		check('title')
			.not()
			.isEmpty(),
		check('description').isLength({ min: 10 })
	],
	postsControllers.createAPost
);

router.patch(
	'/edit/:pid',
	[
		(check('title')
			.not()
			.isEmpty(),
		check('post').isLength({ min: 10 }))
	],
	postsControllers.updatePostById
);

router.delete('/:pid', postsControllers.deletePostById);
//-------------------------Posts Routes Ends-----------------------------

module.exports = router;
