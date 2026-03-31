const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// const startBlockchainListener = require("./services/blockchainService.js");
// startBlockchainListener();

module.exports = app;
