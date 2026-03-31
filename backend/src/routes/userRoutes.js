const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authMiddleware");
const { getUserTransaction } = require("../controllers/userController");

router.get("/:id/transaction", verifyToken, getUserTransaction);

module.exports = router;
