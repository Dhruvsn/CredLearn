const { Client } = require("pg");

const client = new Client({
  user: "batman",
  host: "localhost",
  database: "credlearn",
  password: "password",
  port: 5432,
});

const query = `
CREATE TABLE users(

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_address VARCHAR(200) NOT NULL,
  sc_balance INT NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Transaction schema

CREATE TABLE Transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id),
  amount INT NOT NULL,
  blockchain_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

`;
async function main() {
  try {
    await client.connect();
    await client.query(query);
    console.log("Database populated successfully");
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
