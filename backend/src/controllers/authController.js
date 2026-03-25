const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, getUserByEmail } = require("../models/userModel.js");

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

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "1h",
      },
    );

    const options = {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    };

    res.cookie("token", token, options);
    res.status(200).json({
      success: true,
      token,
      message: "User login successfully!",
    });
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  register,
  login,
};
