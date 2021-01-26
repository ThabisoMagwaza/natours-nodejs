const multer = require('multer')
const sharp = require('sharp')

const Tour = require('../models/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, createOne, updateOne, findOne, findAll } = require('./handerFactory');

module.exports.getTourId = (req,res,next) => {
	if(!req.params.id) req.params.id = req.params.tourId;
	next();
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) => {
	file.mimetype.startsWith('image') ?
	cb(null,true):
	cb(new AppError('Please only upload images',400), false)
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter	
})

module.exports.uploadImages = upload.fields([
	{name: 'imageCover', maxCount: 1},
	{name: 'images', maxCount: 3}
])

module.exports.resizeImages = catchAsync(async (req,res,next) => {
	if(!(req.files.imageCover || req.files.images)) return next();

	req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpg`;

	const promises = [];

	if(req.files.imageCover) promises.push(
		 await sharp(req.files.imageCover[0].buffer)
		.resize(500,500)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`./public/img/tours/${req.body.imageCover}`)
	)
	
	if(req.files.images) {
		req.body.images = [];
		
		req.files.images.forEach((image,index) => {
			const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpg`

			promises.push(	sharp(image.buffer)
								.resize(2000,1333)
								.toFormat('jpeg')
								.jpeg({quality:90})
								.toFile(`./public/img/tours/${filename}`))

			req.body.images.push(filename)
		});
	}

	await Promise.all(promises)

	next()
})

module.exports.getMontlyPlan = catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const year = parseInt(req.params.year);

	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates'
		},
		{
			$match: {startDates: {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)} }
		},
		{
			$group: {
				_id: {$month: '$startDates'},
				numTourStarts: {$sum: 1},
				tours: {$push: '$name'}
			}
		},
		{
			$sort: {numTourStarts: -1}
		},
		{
			$addFields: {
				month: '$_id'
			}
		},
		{
			$project: {
				_id: 0
			}
		}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			plan
		}
	});
});

module.exports.getTourStats = catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const stats = await Tour.aggregate([
		{
			$match: {ratingsAverage: {$gte: 4.5}}
		},
		{
			$group: {
				_id: {$toUpper: '$difficulty'},
				numTours: {$sum: 1},
				numRatings: {$sum: '$ratingsQuantity'},
				avgRating: {$avg: '$ratingsAverage'},
				avgPrice: {$avg: '$price'},
				minPrice: {$min: '$price'},
				maxPrice: {$max: '$price'}
			}
		},
		{
			$sort: {avgPrice: -1}
		}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});

module.exports.top5Cheap = (req,res,next) => {
	req.query.sort = '-ratingsAverage,price';
	req.query.limit = 5;
	next();
};

module.exports.getToursWithin = catchAsync(async(req,res,next) => { // eslint-disable-line no-unused-vars
	const {distance, latlng, unit} = req.params;

	const [lat, lng] = latlng.split(',');

	if(!(lat && lng)) return next(new AppError('Please provide latitude and longitude in the format: lat,lng'), 400);

	const earthRadiusKm = 6371;
	const earthRadiusMi = 3958.8;

	const radius = unit === 'km' ? distance / earthRadiusKm : distance / earthRadiusMi; 

	const tours = await Tour.find({
		startLocation: {
			$geoWithin: {
				$centerSphere: [[lng,lat], radius ]
			}
		}
	});

	res.status(200).json({
		result: 'success',
		results: tours.length,
		data: {
			data: tours
		}
	});

});

module.exports.calcDistaces = catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const {latlng, unit} = req.params;

	const [lat,lng] = latlng.split(',');

	const multiplier = unit === 'km' ? 0.001 : 0.000621371;

	const distances = await Tour.aggregate([{
		$geoNear: {
			near: {
				type: 'Point',
				coordinates: [lng * 1,lat * 1]
			},
			distanceField: 'distance',
			distanceMultiplier: multiplier
		}
	}, {
		$project: {
			name: 1,
			distance: 1
		}
	}
	]);

	res.status(200).json({
		result: 'success',
		data: {
			data: distances
		}
	});
});

module.exports.getAllTours = findAll(Tour);
module.exports.getTour = findOne(Tour, {
	path: 'reviews',
	select: 'review rating user'
});
module.exports.updateTour = updateOne(Tour);
module.exports.addTour = createOne(Tour);
module.exports.deleteTour = deleteOne(Tour);