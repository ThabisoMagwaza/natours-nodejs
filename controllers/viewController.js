const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingsModel')


module.exports.renderOverviewPage = catchAsync(async (req,res,next) => {
	const tours = await Tour.find();

	res.status(200).render('overview',{title: 'All tours', tours});
});

module.exports.renderTourPage = catchAsync(async (req,res,next) => {
	const tour = await Tour.findOne({slug:req.params.slug}).populate({
		path: 'reviews',
		select: 'review rating'
	});

	if(!tour) return next(new AppError(`No tour with name: ${req.params.slug}`), 404)

	res.status(200).render('tour', {tour, title: tour.name});
});

module.exports.renderLoginPage = (req,res) => {
	res.status(200).render('login', {title: 'Log into your account'});
};

module.exports.renderAccountPage = (req,res) => {
	res.status(200).render('account', {title: 'Your Account'})
}

module.exports.submitUserData = catchAsync(async(req,res,next) => {
	const updatedUser = await User.findByIdAndUpdate(	req.user._id,
														{
															name: req.body.name,
															email:req.body.email
														},
														{
															new:true,
															runValidators: true
														}
													)

	if(!updatedUser) return next(new AppError('Error updating user, please try again', 400))

	res.status(200).render('account',{
		title: 'Your accout',
		user: updatedUser
	})
})

module.exports.getMyTours = catchAsync(async( req,res,next) => {
	const bookings = await Booking.find({user: req.user._id});
	
	const tourIds = bookings.map( b => b.tour._id)

	const tours = await Tour.find({_id: {$in: tourIds}})

	res.render('overview', {
		title: 'My Tours',
		tours
	})
})