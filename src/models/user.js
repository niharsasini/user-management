// src/models/user.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(191), 
        allowNull: false,
        unique: {
          name: 'users_email_unique' // Named index
        },
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATEONLY, // Changed to DATEONLY since we don't need time
        allowNull: false,
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING(64), // Limited length since it's a hash
        allowNull: true,
        unique: false // Removed unique constraint
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      timestamps: true,
      paranoid: true, // Soft delete support
      indexes: [
        // Composite index for password reset
        {
          name: 'password_reset_index',
          fields: ['resetPasswordToken', 'resetPasswordExpires'],
          unique: false
        }
      ]
    }
  );

  // Clean up expired reset tokens
  User.cleanupResetTokens = async function() {
    return this.update(
      {
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      {
        where: {
          resetPasswordExpires: {
            [sequelize.Op.lt]: new Date()
          }
        }
      }
    );
  };

  return User;
};
