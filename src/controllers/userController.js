// src/controllers/userController.js
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// List users with search and sort
exports.listUsers = async (req, res) => {
  try {
    const {
      search,
      sortField = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    // Validate sort field
    const allowedSortFields = ['name', 'email', 'dob', 'createdAt'];
    if (!allowedSortFields.includes(sortField)) {
      return res.status(400).json({ message: 'Invalid sort field' });
    }

    // Validate sort order
    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid sort order' });
    }

    // Build search condition
    const searchCondition = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch users with pagination, search, and sort
    const { count, rows: users } = await User.findAndCountAll({
      where: searchCondition,
      order: [[sortField, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      users,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dob } = req.body;
    const user = await User.findByPk(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    await user.update({
      name: name || user.name,
      dob: dob || user.dob,
      profileImage: req.file ? req.file.path : user.profileImage
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
