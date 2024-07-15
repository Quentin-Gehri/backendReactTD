const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); 

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reparations'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('MySQL Connected...');
});

app.get('/api/data', async (req, res) => {
  try {
    const sql = 'SELECT * FROM client JOIN reparation on client.client_id = reparation.reparation_client_id';
    const result = await query(sql);
    res.json(result);
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.get('/api/data/:id', async (req, res) => {
  const { id } = req.params; 
  try {
    const sql = `SELECT * FROM client JOIN reparation ON client.client_id = reparation.reparation_client_id WHERE reparation.reparation_id = ${id}`;
    const result = await query(sql);
    if (result.length === 0) {
      res.status(404).json({ error: 'Réparation non trouvée' });
    } else {
      res.json(result[0]);
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de la réparation depuis MySQL:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réparation depuis MySQL' });
  }
});


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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
