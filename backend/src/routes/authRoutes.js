const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController.js");
const {
  validate,
  userValidationRules,
} = require("../middlewares/userValidatorMiddleware.js");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/register", userValidationRules, validate, register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/refresh-token", refreshToken);

module.exports = router;
