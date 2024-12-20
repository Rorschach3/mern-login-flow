const express = require('express');
const UserController = require('../controllers/UserController');
const { identifier } = require('../middleware/identification');
const router = express.Router();

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.post('/signout', identifier, UserController.signout);

router.patch(
	'/send-verification-code',
	identifier,
	UserController.sendVerificationCode
);
router.patch(
	'/verify-verification-code',
	identifier,
	UserController.verifyVerificationCode
);
router.patch('/change-password', identifier, UserController.changePassword);
router.patch('/send-forgot-password-code',UserController.sendForgotPasswordCode);
router.patch(
	'/verify-forgot-password-code',
	UserController.verifyForgotPasswordCode
);


module.exports = router;
