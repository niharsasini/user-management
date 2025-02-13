const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { updateProfileValidation, profileImageValidation } = require('../validators/userValidator');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// List users with search and sort
router.get('/list', userController.listUsers);

// Get user profile
router.get('/profile/:userId', userController.getProfile);

// Update profile
router.patch(
  '/profile/:userId',
  upload.single('profileImage'),
  [...updateProfileValidation, ...profileImageValidation],
  userController.updateProfile
);

// Delete account
router.delete('/:userId', userController.deleteAccount);

module.exports = router;
