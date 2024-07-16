const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

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

app.get('/api/reparations', async (req, res) => {
  try {
    const sql = 'SELECT * FROM client JOIN reparation ON client.client_id = reparation.reparation_client_id';
    const [result] = await db.promise().query(sql);
    res.json(result);
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const sql = 'SELECT * FROM client';
    const [result] = await db.promise().query(sql);
    res.json(result);
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.get('/api/reparations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT * FROM client JOIN reparation ON client.client_id = reparation.reparation_client_id WHERE reparation.reparation_id = ?';
    const [result] = await db.promise().query(sql, [id]);
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

app.post('/api/addClients', async (req, res) => {
  try {
    const { nom, email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nom || !email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Le nom et l\'adresse email valides sont obligatoires' });
    }
    const sql = 'INSERT INTO client (client_nom, client_email) VALUES (?, ?)';
    await db.promise().query(sql, [nom, email]);
    res.status(201).json({ message: 'Client ajouté avec succès', client: { nom, email } });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du client à MySQL :', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du client à MySQL. Veuillez réessayer plus tard.' });
  }
});

app.post('/api/addReparations', async (req, res) => {
  try {
    const statut = "À faire";
    const { idClient, appareil, description } = req.body;
    if (!idClient || isNaN(idClient) || idClient <= 0) {
      return res.status(400).json({ error: 'L\'identifiant du client doit être un nombre entier positif' });
    }
    if (!appareil || !description) {
      return res.status(400).json({ error: 'L\'appareil et la description sont obligatoires' });
    }
    const clientExists = await checkClientExists(idClient);
    if (!clientExists) {
      return res.status(404).json({ error: `Le client avec l'id ${idClient} n'existe pas. Veuillez vérifier l'identifiant du client.` });
    }
    const dateDepot = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'INSERT INTO reparation (reparation_client_id, reparation_appareil, reparation_description, reparation_statut, reparation_date_depot) VALUES (?, ?, ?, ?, ?)';
    await db.promise().query(sql, [idClient, appareil, description, statut, dateDepot]);
    res.status(201).json({ message: 'Réparation ajoutée avec succès', idClient, appareil, description, statut, dateDepot });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la réparation à MySQL :', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la réparation à MySQL. Veuillez réessayer plus tard.' });
  }
});

app.put('/api/updateReparation/:repairId', async (req, res) => {
  const { repairId } = req.params;
  try {
    const { appareil, description, statut } = req.body;
    if (!appareil || !description || !statut) {
      return res.status(400).json({ error: 'L\'appareil, le statut et la description sont obligatoires' });
    }
    const sql = 'UPDATE reparation SET reparation_appareil = ?, reparation_description = ?, reparation_statut = ? WHERE reparation_id = ?';
    await db.promise().query(sql, [appareil, description, statut, repairId]);
    res.status(200).json({ message: 'Réparation mise à jour avec succès', appareil, description, statut });
  } catch (err) {
    console.error('Erreur lors de la mise à jour réparation à MySQL :', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réparation à MySQL. Veuillez réessayer plus tard.' });
  }
});

const checkClientExists = async (clientId) => {
  try {
    const sql = 'SELECT client_id FROM client WHERE client_id = ?';
    const [result] = await db.promise().query(sql, [clientId]);
    return result.length > 0;
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'existence du client :', err);
    throw err;
  }
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
