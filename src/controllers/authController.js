const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { User } = require("../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { sendPasswordResetEmail } = require('../services/emailService');

// Helper function to handle validation errors
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return {
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    };
  }
  return null;
};

exports.signup = async (req, res, next) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req);
    if (validationError) {
      return res.status(validationError.statusCode).json(validationError);
    }

    const { name, email, password, dob, profileImage } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dob: new Date(dob),
      profileImage
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          dob: user.dob,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req);
    if (validationError) {
      return res.status(validationError.statusCode).json(validationError);
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          dob: user.dob,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req);
    if (validationError) {
      return res.status(validationError.statusCode).json(validationError);
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    console.log(req.user)
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req);
    if (validationError) {
      return res.status(validationError.statusCode).json(validationError);
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal whether a user exists or not
      return res.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + (Number(process.env.PASSWORD_RESET_EXPIRES) || 3600000); // 1 hour

    // Save reset token
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry)
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: "If your email is registered, you will receive a password reset link"
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req);
    if (validationError) {
      return res.status(validationError.statusCode).json(validationError);
    }

    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    next(error);
  }
};
