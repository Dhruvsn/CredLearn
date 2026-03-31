const jwt = require("jsonwebtoken");

const verfiyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "401 Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!decoded) {
      return res.status(401).json({
        user: "user not found!",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verfiyToken;
