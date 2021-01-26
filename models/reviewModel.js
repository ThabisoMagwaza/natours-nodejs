const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const schema = new mongoose.Schema({
	review: {
		type: String,
		trim: true,
		required: [true,'Review is a required field']
	},
	rating: {
		type: Number,
		min: [1, 'Minimum rating is 1'],
		max: [5, 'Max rating is 5'],
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'A review must belong to a user']
	},
	tour: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'A review must belong to a tour']
	}
});

schema.index({user:1,tour:1},{unique: true});

schema.statics.calcAverageRatings = async function(tour) {
	return await this.aggregate([
		{
			$match: {
				tour: tour 
			},
		},
		{
			$group: {
				_id: '$tour',
				numReviews: {$sum: 1},
				avgRatings: {$avg: '$rating'}
			}	
		}
	]);
};

schema.methods.updateTourReviewStats = async function(document,tourId) {
	const ratingsAgg = await document.constructor.calcAverageRatings(tourId);
	await Tour.findByIdAndUpdate(tourId,{
		ratingsAverage: ratingsAgg[0].avgRatings,
		ratingsQuantity: ratingsAgg[0].numReviews
	});  
};

// PRE-FIND MIDDLEWARE
schema.pre(/^find/, async function(next) {
	this.populate( {
		path: 'user',
		select: 'name email photo'
	});
	next();
});


schema.pre(/^findOneAnd/, async function(next) {
	this.r = await this.findOne();
	next();
});

schema.post(/^findOneAnd/,async function() {
	await this.r.updateTourReviewStats(this.r,this.r.tour);  
});


// PRE-SAVE MIDDLEWARE 
schema.post('save', async function() {
	await this.updateTourReviewStats(this,this.tour);
});

module.exports = mongoose.model('Review', schema);