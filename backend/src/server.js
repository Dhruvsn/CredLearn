require("dotenv").config();
const app = require("./app.js");
require("./db/pool.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server listening at : http://localhost:${PORT}`);
});
