const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A user must have a name'],
		minlength: [5, 'A username must be at least 10 characters long'],
		maxlength: [40,'A username must be at most 40 characters long'],
		trim: true
	},
	email: {
		type: String,
		requires: [true, 'A user must have a password'],
		unique: true,
		validate: [validator.isEmail, 'A user email must be a valid email']
	},
	role: {
		type: String,
		enum: {
			values: ['user', 'admin','guide', 'guide-lead'],
			message: 'User can either have the role of: user, admin, guide, guide-lead'
		},
		default: 'user'
	},
	photo: {
		type: String,
		default: 'default.jpg'
	},
	password: {
		type: String,
		required:[true,'A user must have a password'],
		minlength: [8, 'A password must be at least 8 characters long'],
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'A user must confirm their password'],
		validate: {
			validator: function(val) {
				return val === this.password;
			},
			message: 'Passwords do not match!'
		}
	},
	changedPasswordAt: {
		type: Date,
		select:false
	},
	passwordResetToken: String,
	passwordResetTokenValidTo: Date,
	isActive: {
		type: Boolean,
		default: true,
		select:false
	}
});

// before SAVE and CREATE
schema.pre('save',async function(next) {
	if(!this.isModified('password')) return next();
	if(!this.changedPasswordAt) this.changedPasswordAt = Date.now();

	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;

	next();
});

schema.pre(/^find/, function(next) {
	this.find({isActive: {$ne: false}});
	next();
});


schema.methods.hasPasswordChangedSince = function(JWTTimestamp) {
	if(this.changedPasswordAt){
		const changedPasswordAtTimestamp = parseInt(this.changedPasswordAt.getTime() / 1000);
		return JWTTimestamp < changedPasswordAtTimestamp;
	}

	return false;
};

schema.methods.isCorrectPassword = async function(candidate) {
	return await bcrypt.compare(candidate,this.password);
};

schema.methods.signJWTToken = function() {
	return jwt.sign({id: this._id},process.env.JWT_PRIVATE_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});
};

schema.methods.createResetPasswordToken = async function() {
	const token = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
	this.passwordResetTokenValidTo = Date.now() + (60 * 10 * 1000);

	await this.save({validateBeforeSave: false});

	return token;
};

schema.methods.isResetTokeExpired = function() {
	return Date.now() > this.passwordResetTokenValidTo;
};


module.exports = mongoose.model('User', schema);