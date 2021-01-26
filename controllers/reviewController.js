const Review = require('../models/reviewModel');

const { deleteOne, createOne, updateOne, findAll } = require('./handerFactory');

module.exports.getReviewId = (req,res,next) => {
	if(!req.params.id) req.params.id = req.params.reviewId;
	next();
};

module.exports.addUserAndTourToBody = (req,res,next) => {
	req.body.user = req.user._id;
	if(req.params.tourId) req.body.tour = req.params.tourId;
	next();
};

module.exports.addIdToRequestParams = (req,res,next) => {
	if(req.params.tourId) req.query.tour = req.params.tourId;
	next();
};

module.exports.getAllReviews = findAll(Review);
module.exports.createReview = createOne(Review);
module.exports.deleteReview = deleteOne(Review);
module.exports.updateReview = updateOne(Review);