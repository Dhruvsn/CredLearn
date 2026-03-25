const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController.js");
const {
  validate,
  userValidationRules,
} = require("../middlewares/userValidatorMiddleware.js");

router.post("/register", userValidationRules, validate, register);
router.post("/login", login);

module.exports = router;
