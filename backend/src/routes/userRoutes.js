const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authMiddleware");
const { getUserTransaction,uploadVideo } = require("../controllers/userController");
const upload = require('../middlewares/uploadMiddleware');

router.get("/:id/transaction", verifyToken, getUserTransaction);
router.post('/upload',verifyToken, upload.single('video'), uploadVideo)

module.exports = router;
