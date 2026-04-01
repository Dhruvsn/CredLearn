const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUserByEmail,
  saveRefreshToken,
} = require("../models/userModel.js");
const { generateToken, generateRefreshToken } = require("../utils/tokens.js");

// register endpoint to create new user and store password hash in database
async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All field required!",
    });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    // store password_hash into db
    const user = await createUser(username, email, password_hash);
    res.status(201).json({
      success: true,
      user,
      message: "User register successfully",
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

// login endpoint to authenticate user and generate access token and refresh token
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All field required!",
    });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const token = generateToken(user);
    const refresh_token = generateRefreshToken(user);

    await saveRefreshToken(refresh_token, user);

    const options = {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    };

    res.cookie("token", token, options);
    res.cookie("refresh_token", refresh_token, options);
    res.status(200).json({
      success: true,
      token,
      refresh_token,
      user,
      message: "User login successfully!",
    });
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

// refresh token endpoint to generate new access token using refresh token
async function refreshToken(req, res) {
  const refreshToken =
    req.body?.refreshToken || req.cookies?.refresh_token || req.headers.authorization?.split(" ")[1];

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token is required!",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await getUserByEmail(decoded.email);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token!",
      });
    }

    const newToken = generateToken(user);

    res.status(200).json({
      token: newToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Internal Server Error",
    });
  }
}

async function logout(req, res) {
  const id = req.user.id;

  try {
    await saveRefreshToken(null, { id });
    res.clearCookie("token", {
      httpOnly: true,
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully!",
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
