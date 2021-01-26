const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouer = require('./routes/viewRouter');
const bookingsRouter = require('./routes/bookingRouter');

const {raiseRouteNotFoundError, globalErroHandler} = require('./controllers/errorController');


const app = express();

// RATE LIMITING
const limit = rateLimit({
	max:100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});

// VIEW TEMPLATE ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression())

// SECURITY HEADERS
app.use('/api',helmet());

app.use(limit);

// DEV LOGGIN
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// BODY PARSER
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser());

// SANITIZE BODY
app.use(expressMongoSanitize());
app.use(xssClean());

// PARAMETER SANITIZATION
app.use(hpp({
	whitelist: ['duration','name','price','maxGroupSize','difficulty', 'ratingsAverage' ]
}));


app.use((req,res,next) => {
	req.requestedAt = new Date().toISOString();
	next();
});

// MOUNT ROUTERS
app.use('/', viewRouer);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingsRouter)
app.all('*', raiseRouteNotFoundError);

app.use(globalErroHandler);

module.exports = app;
