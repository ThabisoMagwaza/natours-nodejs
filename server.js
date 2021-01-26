const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
	path: './.env'
});

process.on('uncaughtException', err => {
	console.log(`${err.stack}`);
	process.exit(1);
});

const app = require('./app');

const DB_CONN = process.env.DATABASE_CONN.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB_CONN, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then( () => {
	console.log('Connected to DB...');
});

const port = 8000;
const server = app.listen(port, 'localhost', () => {
	console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
	console.log(`${err.name}: ${err.message}`);
	server.close( () => {
		process.exit(1);
	});
});