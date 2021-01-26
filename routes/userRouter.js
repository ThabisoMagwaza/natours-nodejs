const express = require('express');


const {getAllUsers, addUser, getUser, updateUser,deleteUser,updateMe, deleteMe, addUserToQueryParams, updatePassword, addTokenToQueryParams, uploadImage, resizeImage, getMyTours} = require('../controllers/userController');
const {signup,checkLoginCredentials,login, forgotPassword, resetPassword, authenticate, authorize, logout} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(checkLoginCredentials,login);
router.route('/logout').get(logout)


router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);


router.use(authenticate);

router.route('/me').get(addUserToQueryParams,getUser);
router.route('/update-me').patch(uploadImage,resizeImage,updateMe);
router.route('/delete-me').delete(deleteMe);
router.route('/update-password').put(updatePassword)

router.use(authorize('admin'));

router.route('/')
	.get(getAllUsers)
	.post(addUser);

router.route('/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser);
    
module.exports = router;