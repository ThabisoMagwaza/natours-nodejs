const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const QueryBuilder = require('../utils/QueryBuilder');

module.exports.deleteOne = Model => catchAsync(async(req,res,next) => { // eslint-disable-line no-unused-vars
	const doc = await Model.findByIdAndDelete(req.params.id);
    
	if(!doc) return next( new AppError(`No document wth Id: ${req.params.id} found`, 404));

	res.status(204).json({
		status: 'success',
		data: null
	});
});

module.exports.createOne = Model => catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const doc = await Model.create(req.body);

	res.status(200).json({
		status: 'success',
		data: {
			data: doc
		}
	});
});

module.exports.updateOne = Model => catchAsync( async (req,res,next) => { // eslint-disable-line no-unused-vars
	const doc = await Model.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators:true});

	if(!doc) throw new AppError(`No document wth Id: ${req.params.id} found`, 404);

	res.status(200).json({
		status: 'success',
		data: {
			data: doc
		}
	});
});

module.exports.findOne = (Model ,populateOptions) => catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const query = Model.findById(req.params.id);
	if(populateOptions) query.populate(populateOptions);

	const doc = await query;

	if(!doc) throw new AppError(`No document with Id: ${req.params.id} found`,404);

	res.status(200).json({
		status: 'success',
		data: {
			data: doc
		}
	});
});

module.exports.findAll = Model => catchAsync( async (req, res,next) => { // eslint-disable-line no-unused-vars
	// BUILD QUERY
	const query = new QueryBuilder(req.query, Model)
		.filter()
		.sort()
		.fields()
		.limit()
		.query;

	// SEND
	const docs = await query;
	

	res.status(200).json({
		status: 'success',
		results: docs.length,
		data: {
			data: docs
		}
	});
});