const mongoose = require('mongoose');
const slugify = require('slugify');
const Review = require('./reviewModel');

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		trim: true,
		maxlength: [40, 'A tour name must have <= 40 characters'],
		minlength: [10, 'A tour name must have >= 10 characters']
	},
	slug: String,
	duration: {
		type: Number,
		required: [true, 'A tour must have a duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'A tour must have a max group size']
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have a difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'A tour difficulty is either: easy, medium or difficult'
		}
	},
	ratingsAverage: {
		type: Number,
		default: 4.5,
		min: [1, 'A tour must have a minimum rating of 1.0'],
		max: [5, 'A tour must have a maximum rating of 5.0'],
		set: val => Math.round(val * 10) /10

	},
	ratingsQuantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price'],
		min: [0, 'A tour cannot have a negative price']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function(val) {
				return val <= this.price;
			},
			message: 'Discout price must be >= full price'
		},
		default: 0
	},
	summary: {
		type:String,
		trim: true,
		required: [true, 'A tour must have a summary']
	},
	description: {
		type: String,
		trim: true
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	imageCover: {
		type: String,
		required:true,
		trim: true
	},
	images: [String],
	startDates: [Date],
	isSecreteTour: {
		type: Boolean,
		default: false
	},
	startLocation: {
		type: {
			type: String,
			default: 'Point',
			enum: 'Point'
		},
		coordinates: [Number],
		description: String,
		address:String
	},
	locations: [
		{
			type:{
				type: String,
				default: 'Point',
				enum: 'Point',
			},
			coordinates: [Number],
			description: String,
			address: String,
			day: Number
		}
	],
	guides: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User'
		}
	]
}, {
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

schema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});

schema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'tour'
});

// DOCUMENT MIDDLEWARE: run on .save() and .create()
schema.pre('save', function(next) {
	this.slug = slugify(this.name, {lower: true});
	next();
});

schema.pre('findOneAndDelete',async function(next) {
	const doc = await this.findOne();
	console.log(`removing reviews for tour... ${doc._id}`);
	await Review.deleteMany({tour: doc._id});
	next();
});

// QUERY MIDDLEWARE: run on a query

schema.pre(/^find/, function(next) {
	this.find({isSecreteTour: {$ne: true}});
	next();
});

schema.pre(/^find/, async function(next) {
	this.populate({
		path: 'guides',
		select: 'name email role photo'
	});
	next();
});

schema.index({startLocation: '2dsphere'});


// AGGREGATION MIDDLEWARE: run on 'aggregate'

// schema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({$match: {isSecreteTour: {$ne: true}}});
// 	next();
// });

// Indexes 
schema.index({price: 1, ratingsAverage: -1});
schema.index({slug: 1});

module.exports = mongoose.model('Tour', schema);