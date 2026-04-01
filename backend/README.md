# CredLearn Backend

This is the backend service for the CredLearn platform. It is built with Node.js and Express, and utilizes a PostgreSQL database. It features secure user authentication and interaction with the BNB Smart Chain (BSC).

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

## Features
- **User Authentication:** Registration, Login, Logout, and Token Refresh using JWT and bcrypt.
- **Ethereum/BSC Integration:** Interaction with blockchain networks using `ethers.js`.
- **Database:** PostgreSQL integration for structured data storage.
- **File Uploads:** Video/file uploading functionality via `multer`.
- **Validation:** Request body validation with `express-validator`.
- **Security:** Cross-Origin Resource Sharing (CORS) and Cookie parsing.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher is recommended)
- [PostgreSQL](https://www.postgresql.org/) database server running locally or remotely
- npm (Node Package Manager)

## Installation

1. Navigate to the backend directory (if you aren't already there):
   ```bash
   cd backend
   ```
2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root of the backend directory. Here is a template based on the required environment variables:

```env
PORT=5000
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRATION=1d

DB_USER=batman
DB_HOST=localhost
DB_NAME=credlearn
DB_PASSWORD=password
DB_PORT=5432 

BNB_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
ADMIN_PRIVATE_KEY=your_admin_private_key
```

## Running the Application

### Development Mode
To start the server with auto-reloading enabled via `nodemon` (recommended for development):
```bash
npm run dev
```

### Regular Start
To start the server normally:
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- **`POST /register`**: Register a new user account.
- **`POST /login`**: Authenticate a user and receive JWT access and refresh tokens.
- **`POST /logout`**: Logout a user (Requires authentication).
- **`POST /refresh-token`**: Request a new access token using a valid refresh token.

### Users (`/api/users`)
- **`GET /:id/transaction`**: Fetch a specific user's transactions (Requires authentication).
- **`POST /upload`**: Upload a video file (Requires authentication, uses `multipart/form-data` with `video` field).
