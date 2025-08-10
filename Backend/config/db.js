// config/db.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional: Test the database connection once at startup
(async () => {
  try {
    const connection = await pool.promise().getConnection();
    console.log("✅ Connected to MySQL!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

module.exports = pool.promise();
