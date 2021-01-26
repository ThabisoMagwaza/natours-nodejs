const { authenticate } = require('../controllers/authController');
const { createPaymentIntet, findAllBookings, createBooking, updateBooking, findBooking, deleteBooking } = require('../controllers/bookingController');

const router = require('express').Router();

router.use(authenticate)

router.route('/')
    .get(findAllBookings)
    .post(createBooking)

router.route('/:id')
    .get(findBooking)
    .delete(deleteBooking)
    .patch(updateBooking)

module.exports = router;