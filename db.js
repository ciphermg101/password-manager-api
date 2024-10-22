// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Set up the PostgreSQL connection pool with error handling
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Log when a connection is made
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Export the query function for use in other parts of the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};
