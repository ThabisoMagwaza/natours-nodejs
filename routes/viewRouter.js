const express = require('express');
const { isLoggedIn, authenticate } = require('../controllers/authController');
const { renderOverviewPage, renderTourPage, renderLoginPage, renderAccountPage, submitUserData,getMyTours } = require('../controllers/viewController');


const router = express.Router();

router.get('/', isLoggedIn,renderOverviewPage);
router.get('/login', isLoggedIn,renderLoginPage);
router.get('/me',authenticate ,renderAccountPage);
router.get('/tour/:slug', isLoggedIn,renderTourPage);
router.post('/submit-user-data',authenticate,submitUserData)
router.route('/my-tours').get(authenticate,getMyTours)


module.exports = router;


