const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

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

app.listen(5000, () => console.log('API IS RUNNING ON PORT 5000.....'));
