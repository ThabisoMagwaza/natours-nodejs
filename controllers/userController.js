const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/userModel');
const Booking = require('../models/bookingsModel')
const Tour = require('../models/tourModel')

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, findOne, updateOne, findAll } = require('./handerFactory');

module.exports.addUserToQueryParams = (req,res,next) => {
	req.params.id = req.user._id;
	next();
};

module.exports.addTokenToQueryParams = (req,res,next) => {
	req.params.token = req.cookies.jwt; 
	next()
}

// const multerStorage = multer.diskStorage({
// 	destination: (req,file,cb) => {
// 		cb(null,`${__dirname}/../public/img/users`)
// 	},
// 	filename: (req,file,cb) => {
// 		const ext = file.mimetype.split('/')[1]
// 		cb(null,`user-${req.user._id}-${Date.now()}.${ext}`)
// 	}
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb) => {
	file.mimetype.startsWith('image') ? 
	cb(null,true):
	cb(new AppError('Please upload only images', 400),false)
}

const upload =  multer({
	storage: multerStorage,
	fileFilter: multerFilter
})


module.exports.uploadImage = upload.single('photo')

module.exports.resizeImage = catchAsync( async (req,res,next) => {
	if(!req.file) return next()

	req.file.filename = `user-${req.user._id}-${Date.now()}.jpg`

	await sharp(req.file.buffer)
		.resize(500,500)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`./public/img/users/${req.file.filename}`)

	next()
})

module.exports.updateMe = catchAsync(async(req,res,next) => { 
	const keys = Object.keys(req.body);
	if(keys.includes('password') || keys.includes('passwordConfirm')) return next(new AppError('Cannot update password information, user /forgot-password or /update-password',400));

	const allowedUpdateFields = ['name','email'];
	const updateObject = allowedUpdateFields.reduce((acc,val) => {
		if( req.body[val]) acc[val] = req.body[val];
		return acc;
	},{});

	if(req.file.filename) updateObject.photo = req.file.filename;
	const user = await User.findByIdAndUpdate(req.user._id,updateObject, {runValidators: true, new: true});

	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	});
});

module.exports.deleteMe = catchAsync(async (req,res,next) => { // eslint-disable-line no-unused-vars
	const user = await User.findById(req.user._id);

	user.isActive = false;
	await user.save({validateBeforeSave:false});

	res.status(204).json({
		status: 'success',
		data: null
	});
});

module.exports.addUser = (req,res) => {
	res.status(500).json({
		status: 'fail',
		message: 'This route is not implemented, please use /v1/signup'
	});
};

module.exports.updatePassword = catchAsync(async (req,res,next) => {
	const user = await User.findById(req.user._id).select('+password')
	const isPassCorrect = await user.isCorrectPassword(req.body.currentPassword)
	if(!isPassCorrect) return next(new AppError('Incorrect user password!', 400))
	
	req.user.password = req.body.newPassword;
	req.user.passwordConfirm = req.body.passwordConfirm;
	await req.user.save({validateBeforeSave: true});

	res.status(200).json({
		status: 'success',
		data: null
	})
})



module.exports.getAllUsers = findAll(User);
module.exports.getUser = findOne(User);
module.exports.deleteUser = deleteOne(User);
module.exports.updateUser = updateOne(User);