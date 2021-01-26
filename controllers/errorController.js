const AppError = require('../utils/AppError');

const createErrorResProd = err => {
	if(err.isOperational)  {
		return {
			status: err.status,
			message: err.message
		};
	} else{
		console.log('Error 🔥', err);
		return {
			status: 'fail',
			message: 'Something went wrong!'
		};
	} 
};

const createErrorResDev = err => ({
	status: err.status,
	message: err.message,
	error: err,
	stack: err.stack
});


const createErrorRes =  env => error => {
	const errorHandlers = {
		'development': createErrorResDev,
		'production': createErrorResProd
	};
    
	return errorHandlers[env](error);
};

const createCastAppError = err => new AppError(`Cannot convert ${err.stringValue} to valid ${err.path}`,400);

const createUniqueAppError = err => new AppError(`Duplicate value Error:${JSON.stringify(err.keyValue)} already exists.`);

const createValidationAppError = err => new AppError(Object.values(err.errors).reduce((ErrorMessages, ErrorMessage) => ErrorMessages === ''? ErrorMessage : `${ErrorMessages}. ${ErrorMessage}`,''), 400);

const createInvalidTokenAppError = () => new AppError('Invalid token! Please login and try again.', 401);
const createTokenExpiredAppError = () => new AppError('Expired token! Please login and try again.', 401);

module.exports.raiseRouteNotFoundError = (req,res,next) => {
	next(new AppError(`cannot find route ${req.originalUrl} on the server!`, 404));
}; 


module.exports.globalErroHandler =(err,req,res,next) => {
	let error = Object.create(err);

	// JsonWebTokenError
	// TokenExpiredError

	if(error.name === 'CastError')  error = createCastAppError(error);
	else if(error.code === 11000) error = createUniqueAppError(error);
	else if(error.name === 'ValidationError') error = createValidationAppError(error);
	else if(error.name === 'JsonWebTokenError') error = createInvalidTokenAppError();
	else if(error.name === 'TokenExpiredError') error = createTokenExpiredAppError();
	else{
		error.statusCode = error.statusCode || 500;
		error.status = error.status || 'error';
	}
	
	const errorRes = createErrorRes(process.env.NODE_ENV)(error);

	req.originalUrl.startsWith('/api') ?
	// CREATE ERROR RESP
	res.status(error.statusCode).json(errorRes) :
	// RENDER ERROR PAGE
	res.status(error.statusCode).render('error', {title: 'Something Went Wrong', error: errorRes})
	
	next();
};