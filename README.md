# User Management API

A Node.js backend API for user management with authentication, profile management, and file upload capabilities.

## Features

- User authentication (signup/login)
- JWT-based authentication
- Profile management
- Profile image upload
- Password management (update, forgot, reset)
- Account deletion
- Input validation
- Error handling
- Database integration with MySQL
- Email notifications for password reset

## Prerequisites

- Node.js (v14 or higher)
- MySQL
- npm or yarn
- SMTP server access for emails

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Create the uploads directory:
   ```bash
   mkdir uploads
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user
- Body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1990-01-01"
  }
  ```

#### POST /api/auth/login
Login with existing credentials
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### User Management

#### GET /api/user/list
List users with search and sort functionality (requires authentication)
- Header: `Authorization: Bearer <token>`
- Query Parameters:
  ```
  search: Search term for name or email
  sortField: Field to sort by (name, email, dob, createdAt)
  sortOrder: ASC or DESC
  page: Page number (default: 1)
  limit: Items per page (default: 10)
  ```
- Response:
  ```json
  {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "dob": "1990-01-01",
        "profileImage": "uploads/profile1.jpg",
        "createdAt": "2024-02-13T06:25:00.000Z",
        "updatedAt": "2024-02-13T06:25:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 10
    }
  }
  ```

#### GET /api/user/profile
Get user profile (requires authentication)
- Header: `Authorization: Bearer <token>`

#### PUT /api/user/profile
Update user profile (requires authentication)
- Header: `Authorization: Bearer <token>`
- Body (multipart/form-data):
  ```
  name: "John Doe"
  dob: "1990-01-01"
  profileImage: <file>
  ```

#### DELETE /api/user/account
Delete user account (requires authentication)
- Header: `Authorization: Bearer <token>`

### Password Management

#### PUT /api/password/update
Update password (requires authentication)
- Header: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }
  ```

#### POST /api/password/forgot
Request password reset
- Body:
  ```json
  {
    "email": "john@example.com"
  }
  ```

#### POST /api/password/reset
Reset password using token
- Body:
  ```json
  {
    "token": "reset_token_from_email",
    "newPassword": "newPassword123"
  }
  ```

## Password Requirements

New passwords must:
- Be at least 6 characters long
- Contain at least one number
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one special character (!@#$%^&*)

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Security

- Password hashing using bcrypt
- JWT for authentication
- CORS enabled
- Helmet for security headers
- Input validation
- File upload restrictions
- Secure password reset flow
- Email notifications
