const express = require('express');

const postsControllers = require('../controllers/posts-controllers');

const router = express.Router();

//-------------------------Posts Routes Starts------------------------
router.get('/', postsControllers.getAllPosts);

router.get('/:pid', postsControllers.getASinglePostsById);

router.get('/user/:uid', postsControllers.getAllPostsByAUser);

module.exports = router;
