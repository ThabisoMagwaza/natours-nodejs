module.exports =  (user,res) => {
	const token = user.signJWTToken();

	const cookieOptions = {
		expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * (24 * 60 * 60 * 1000)),
		httpOnly: true
	};

	if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

	res.cookie('jwt',token, cookieOptions);

	res.status(200).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
};