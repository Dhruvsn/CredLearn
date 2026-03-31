const db = require("../db/pool.js");

async function createUser(username, email, password_hash) {
  const result = await db.query(
    `
    INSERT INTO users (username,email,password_hash, sc_balance, wallet_address) VALUES ($1,$2,$3, 0, '') RETURNING id, username, email
    `,
    [username, email, password_hash],
  );

  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await db.query(
    `
    SELECT * FROM users WHERE email = $1
  `,
    [email],
  );

  return result.rows[0];
}

async function saveRefreshToken(refresh_token, user) {
  await db.query(
    `
        UPDATE users SET refresh_token = $1 WHERE id = $2
        `,
    [refresh_token, user.id],
  );
}

async function fetchUserTransaction(id) {
  const result = await db.query(
    `SELECT * FROM transactions WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC`,
    [id],
  );
  return result.rows; // Return the full array of history
}

async function updateTransactionStatus(sessionId, status) {
  const result = await db.query(
    `UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *`,
    [status, sessionId],
  );
  return result.rows[0];
}

module.exports = {
  fetchUserTransaction,
  updateTransactionStatus,
};

module.exports = {
  createUser,
  getUserByEmail,
  fetchUserTransaction,
  saveRefreshToken,
  updateTransactionStatus,
};
