const express = require('express');
const {getAllTours, addTour, getTour, updateTour, deleteTour, top5Cheap, getTourStats, getMontlyPlan, getToursWithin, calcDistaces, uploadImages, resizeImages} = require('../controllers/tourController');
const {authenticate,authorize} = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRouter');

const router = express.Router();

// router.param('id', checkId);

// NESTED ROUTES
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(top5Cheap,getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMontlyPlan);

router.route('/tours-within/:distance/latlng/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/:unit').get(calcDistaces);

router.route('/')
	.get(getAllTours)
	.post(authenticate,authorize('admin', 'guide', 'guide-lead'),addTour);

router.route('/:id')
	.get(getTour)
	.patch(	authenticate,
			authorize('admin','guide','guide-lead'),
			uploadImages,
			resizeImages,
			updateTour)
	.delete(authenticate,authorize('admin','guide','guide-lead'),deleteTour);

    
module.exports = router;
