const HttpError = require('../models/http-error');

let DUMMY_POSTS = [
	{
		id: 'a1',
		title: 'First Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u1'
	},
	{
		id: 'a2',
		title: 'Second Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u1'
	},
	{
		id: 'a3',
		title: 'Third Test Post',
		date: '02-27-2020',
		post:
			"I'm baby blue bottle paleo chillwave, chia you probably haven't heard of them hoodie synth. Narwhal church-key organic, man bun williamsburg bicycle rights gastropub vape street art post-ironic meh ugh austin skateboard. Coloring book ugh master cleanse hell of, put a bird on it hot chicken portland irony semiotics subway tile messenger bag blog. Kinfolk hella actually pabst iPhone. Vape tilde cronut marfa, pickled activated charcoal offal iceland listicle direct trade waistcoat intelligentsia typewriter tumeric raclette. Shabby chic enamel pin portland distillery hella asymmetrical letterpress skateboard. Chicharrones synth tumeric asymmetrical freegan af messenger bag intelligentsia ethical.",
		creator: 'u2'
	}
];

// @type -- GET
// @path -- /api/posts
// @desc -- path to get all the posts
const getAllPosts = (req, res, next) => {
	const posts = DUMMY_POSTS;

	if (posts.length === 0) {
		throw new HttpError('Could Not Find Any Posts', 404);
	}

	res.json({ posts: posts });
};

// @type -- GET
// @path -- /api/posts/:pid
// @desc -- path to get a single posts by id
const getASinglePostsById = (req, res, next) => {
	const postId = req.params.pid;

	const post = DUMMY_POSTS.find((p) => {
		return p.id === postId;
	});

	if (!post || post.length === 0) {
		throw new HttpError('Could Not Find A Post For That Id', 404);
	}

	res.json({ post: post });
};

// @type -- GET
// @path -- /api/posts/user/:uid
// @desc -- path to get posts created by a user
const getAllPostsByAUser = (req, res, next) => {
	const userId = req.params.uid;

	const posts = DUMMY_POSTS.filter((p) => {
		return p.creator === userId;
	});

	if (!posts || posts.length === 0) {
		return next(
			new HttpError('Could Not Find Any Posts For The Provided User ID', 404)
		);
	}

	res.json({ posts: posts });
};

exports.getAllPosts = getAllPosts;
exports.getASinglePostsById = getASinglePostsById;
exports.getAllPostsByAUser = getAllPostsByAUser;
