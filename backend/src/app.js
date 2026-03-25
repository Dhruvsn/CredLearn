const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes.js");

app.use("/api/auth", authRoutes);

module.exports = app;
