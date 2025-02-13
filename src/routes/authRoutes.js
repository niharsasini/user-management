const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
  signupValidation, 
  loginValidation, 
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation

} = require('../validators/authValidator');


const router = express.Router();

// Authentication routes
router.post('/register', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);

// Password management routes
router.patch(
  '/password/update',
  authMiddleware,
  updatePasswordValidation,
  authController.updatePassword
);

router.post(
  '/password/forgot',
  forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  '/password/reset',
  resetPasswordValidation,
  authController.resetPassword
);

module.exports = router;
