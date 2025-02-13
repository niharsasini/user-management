// src/models/index.js
const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./user')(sequelize, DataTypes);

// Define relationships here if needed
// Example: User.hasMany(Posts)

const db = {
  sequelize,
  Sequelize,
  User,
  Op // Export Op for use in queries
};

module.exports = db;
