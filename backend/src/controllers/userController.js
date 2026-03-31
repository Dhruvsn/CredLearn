const validator = require("validator");
const { fetchUserTransaction } = require("../models/userModel");

async function getUserTransaction(req, res) {
  const { id } = req.params.id;
  console.log("User ID: ", id);
  if (!validator.isUUID(id)) {
    return res.status(400).json({
      message: "Invalid user id!",
    });
  }

  if (req.user.id !== id) {
    return res.status(403).json({
      message: "403 Forbidden",
    });
  }

  try {
    const transactions = await fetchUserTransaction(id);

    if (!transactions) {
      return res.status(404).json({
        message: "Transactions not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: transactions,
      message: "Transactions fetched successfully",
    });
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  getUserTransaction,
};
