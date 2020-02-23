// Packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// Packages

// Routes
const placesRoutes = require('./routes/places-routes');
const postsRoutes = require('./routes/posts-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
// Routes

// Express
const app = express();
// Express

// Body Parser To Parse The Incoming Request Bodies
app.use(bodyParser.json());
// Body Parser To Parse The Incoming Request Bodies

// Bringing in the routes and prefixing the routes
app.use('/api/places', placesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
// Bringing in the routes and prefixing the routes

// Error Handling Routes And MiddleWare
app.use((req, res, next) => {
	const error = new HttpError('Could Not Find This Route', 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An Unknown Error Occurred' });
});
// Error Handling Routes And MiddleWare

// Connection To The DataBase And Starting The Server...
mongoose
	.connect(
		'mongodb+srv://jameshagood:Fsuore1234@chatterbox-duf9f.mongodb.net/sharedPlaces?retryWrites=true&w=majority',
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		app.listen(5000, () => console.log('API IS RUNNING ON PORT 5000.....'));
	})
	.then(() => {
		console.log('MongoDB Connected.....');
	})
	.catch((error) => {
		console.log(error);
	});
// Connection To The DataBase And Starting The Server...
