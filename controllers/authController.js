const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const Email = require('../utils/mailer');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const sendLoggedInUserResp = require('../utils/sendLoggeInUserResp');
const catchAsync = require('../utils/catchAsync');


exports.signup = catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const newUser = await User.create(req.body);
	// exclude secrete fields
	newUser.password = undefined,
	newUser.changedPasswordAt = undefined;
	newUser.isActive = undefined;

	await new Email(newUser,`${req.protocol}://${req.get('host')}/me`).sendWelcome();

	sendLoggedInUserResp(newUser,res);
});

exports.checkLoginCredentials = (req,res,next) => {
	if(req.body['email'] && req.body['password']) return next();

	return next(new AppError('Provide both email and password to login',400));
};

exports.login = catchAsync(async(req,res,next) => {
	const user = await User.findOne({email: req.body.email}).select('+password');

	if(!user || !await user.isCorrectPassword(req.body.password)) return next(new AppError('Invalid username or password', 401));
	user.password = undefined;

	sendLoggedInUserResp(user,res);
});

exports.logout = (req,res,next) => {
	const cookieOptions = {
		expires: new Date(Date.now() + 10),
		httpOnly: true
	}

	res.cookie('jwt','logged out')

	res.status(200).json({
		status: "success"
	})
}

exports.authenticate = catchAsync(async (req,res,next) => {
	// 1) get token from auth headers or cookies
	let token;
	req.headers.authorization ? token = req.headers.authorization.split(' ')[1] : token = req.cookies.jwt;

	if(!token) return next(new AppError('Protected resource! Please login and try again', 401));

	// 2) verify token
	const decoded = await promisify(jwt.verify)(token,process.env.JWT_PRIVATE_KEY);

	// 3) check if user still exists
	const user = await User.findById(decoded.id).select('+changedPasswordAt');
	if(!user) return next(new AppError('The user issued this token no longer exists! Please login and try again',401));

	// 4) check if password not changed;
	if(user.hasPasswordChangedSince(decoded.iat)) return next(new AppError('User passoword was changed after the token was issued! Please login and try again', 401));

	req.user = user;
	res.locals.user = user;

	next();
});

exports.isLoggedIn = async (req,res,next) => {
	try {
		// 1) get token from auth headers or cookies
		let token;
		req.headers.authorization ? token = req.headers.authorization.split(' ')[1] : token = req.cookies.jwt;

		if(!token) return next();

		// 2) verify token
		const decoded = await promisify(jwt.verify)(token,process.env.JWT_PRIVATE_KEY);

		// 3) check if user still exists
		const user = await User.findById(decoded.id).select('+changedPasswordAt');
		if(!user) return next();

		// 4) check if password not changed;
		if(user.hasPasswordChangedSince(decoded.iat)) return next();

		// 5) Share amongs all templates
		res.locals.user = user;
	}catch{
		return next();
	}
	next()
};

exports.authorize = (...roles) => (req,res,next) => {
	if(!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403));
	next();
};

exports.forgotPassword = catchAsync(async(req,res,next) => {
	// 1) get user by email
	const user = await User.findOne({email: req.body.email});
	if(!user) return next(new AppError(`No user found with email:${req.body.email}`));
	// 2) create reset token
	const resetToken = await user.createResetPasswordToken();

	await new Email(user,`http://${req.headers.host}/v1/users/reset-password/${resetToken}`).sendResetPassword();

	res.status(200).json({
		status:'success',
		message: 'Reset token send successfully'
	});
});

exports.resetPassword = catchAsync( async(req,res,next) => { // eslint-disable-line no-unused-vars
	// get user by token
	const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
	const user = await User.findOne({passwordResetToken: tokenHash });

	if(!user) throw new AppError('Invalid reset token', 400);

	// check if password is valid
	if(user.isResetTokeExpired()) throw new AppError('Reset token expired', 400);

	// reset password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	// invalidate reset token
	user.passwordResetToken = undefined;
	user.passwordResetTokenValidTo = undefined; 
	await user.save({validateBeforeSave: true});

	// login user
	const token = jwt.sign({id: user._id}, process.env.JWT_PRIVATE_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});

	res.status(200).json({
		status: 'success',
		data: {
			token
		}
	});
});