const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // Import the CORS module

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reparations'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('MySQL Connected...');
});

// API endpoint to fetch data from MySQL
app.get('/api/data', async (req, res) => {
  try {
    const sql = 'SELECT * FROM client';
    const result = await query(sql);
    res.json(result);
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

// Utility function to execute MySQL queries with Promises
const query = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
