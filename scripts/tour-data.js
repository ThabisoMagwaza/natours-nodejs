const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({
	path: `${__dirname}/../.env`
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));

const action = process.argv[2];

const clearDevDB = async () => {
	console.log('clearing dev DB..');
	const deletePromises = [Tour.deleteMany(), User.deleteMany(), Review.deleteMany()];
	await Promise.all(deletePromises);
	console.log('succesfully cleared dev DB!');
};


// PLEASE TURN OFF PASSWORD ENCRYPTION BEFORE RUNNING THIS!!!
const populateDevDB = async () => {
	console.log('Populating dev DB...');
	const populatePromises = [Tour.create(tours), User.create(users,{validateBeforeSave: false}), Review.create(reviews)];
	await Promise.all(populatePromises);
	console.log('successfully populated dev DB!');
};

const performAction = async (action) => {
	if(action === '--delete'){
		try{	
			await clearDevDB();
		}catch(err) {
			console.log(err);
		}
	}
	else if (action === '--populate') {
		console.log('populating dev DB..');
		try{
			await populateDevDB();
		}catch(err) {
			console.log(err);
		}
	} else if (action === '--reset') {
		console.log('reseting dev DB...');
		try{
			await clearDevDB();
			await populateDevDB();
			console.log('successfully reset dev DB!');
		}catch(err) {
			console.log(err);
		}
	}
	process.exit();
};


const DB = process.env.DATABASE_CONN.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then(() => {
	console.log('Connected to DB...');
	performAction(action);
}).catch(() => {
	console.log('Error connecting to DB!');
});