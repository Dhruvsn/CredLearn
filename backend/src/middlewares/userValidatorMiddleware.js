const { body, validationResult } = require("express-validator");
// A reusable function for handling validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

// Validation rules for a user signup request
const userValidationRules = [
  // Validate 'email' (must be a valid email address)
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("email must be a valid email address"),
  // Validate 'password' (must be at least 5 chars long)
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  // Validate 'confirmPassword' using a custom validator
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

module.exports = { validate, userValidationRules };
