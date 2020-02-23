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

exports.getAllPosts = getAllPosts;
