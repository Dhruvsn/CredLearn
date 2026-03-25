const db = require("../db/pool.js");

async function createUser(username, email, password_hash) {
  const result = await db.query(
    `
    INSERT INTO users (username,email,password_hash, sc_balance, wallet_address) VALUES ($1,$2,$3, 0, '') RETURNING id, username, email
    `,
    [username, email, password_hash]
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

module.exports = {
  createUser,
  getUserByEmail,
};
