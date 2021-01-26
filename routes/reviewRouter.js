const express = require('express');
const { authenticate, authorize } = require('../controllers/authController');
const { getAllReviews, createReview, deleteReview, getReviewId, addUserAndTourToBody, updateReview, addIdToRequestParams } = require('../controllers/reviewController');

const router = express.Router({mergeParams: true});

router.use(authenticate);

router.route('/')
	.get(addIdToRequestParams,getAllReviews)
	.post(authorize('user'),addUserAndTourToBody,createReview);

router.use(authorize('admin', 'user'));

router.route('/:id')
	.delete(getReviewId,deleteReview)
	.patch(getReviewId,updateReview);

module.exports = router;