// src/validators/userValidator.js
const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

exports.profileImageValidation = [
  body('profileImage')
    .custom((value, { req }) => {
      if (!req.file) return true;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.');
      }
      if (req.file.size > 5 * 1024 * 1024) {
        throw new Error('File size cannot exceed 5MB');
      }
      return true;
    })
];
