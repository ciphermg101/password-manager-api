// index.js
const express = require('express');
const db = require('./db');  // Import the db connector
const argon2 = require('argon2');  // Import the Argon2 library
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('Password Manager API is running');
});

// Route to get all users
app.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM app_data.users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Route to create a new user
app.post('/users', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Hash the password using Argon2
    const password_hash = await argon2.hash(password);

    const result = await db.query(
      'INSERT INTO app_data.users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, password_hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Route to verify a user's login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get the user from the database by email
    const result = await db.query('SELECT * FROM app_data.users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify the password using Argon2
    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Password is correct, return success response
    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
