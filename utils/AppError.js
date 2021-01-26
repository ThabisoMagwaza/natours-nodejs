module.exports = class AppError extends Error {
	constructor(message = 'error message', statusCode=500 ){
		super(message);

		this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this,this.costructor);
	}
};