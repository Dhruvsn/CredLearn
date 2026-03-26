const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController.js");
const {
  validate,
  userValidationRules,
} = require("../middlewares/userValidatorMiddleware.js");

router.post("/register", userValidationRules, validate, register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
