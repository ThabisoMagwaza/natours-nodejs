const HandlerFactory = require('../controllers/handerFactory')
const Booking = require('../models/bookingsModel')

module.exports.findAllBookings = HandlerFactory.findAll(Booking)
module.exports.findBooking = HandlerFactory.findOne(Booking)
module.exports.createBooking = HandlerFactory.createOne(Booking)
module.exports.updateBooking = HandlerFactory.updateOne(Booking)
module.exports.deleteBooking = HandlerFactory.deleteOne(Booking)