const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lieux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    ville TEXT NOT NULL,
    adresse TEXT NOT NULL,
    code_postal TEXT NOT NULL,
    telephone TEXT,
    site_web TEXT,
    mail TEXT,
    type TEXT NOT NULL CHECK(type IN ('repas suspendus', 'prix libre', 'montant fixe', 'remise')),
    animaux_acceptes BOOLEAN DEFAULT 0
  )`);
});

app.post('/api/lieux', (req, res) => {
  const { nom, ville, adresse, code_postal, telephone, site_web, mail, type, animaux_acceptes } = req.body;
  const stmt = db.prepare(`INSERT INTO lieux (nom, ville, adresse, code_postal, telephone, site_web, mail, type, animaux_acceptes)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(nom, ville, adresse, code_postal, telephone, site_web, mail, type, animaux_acceptes ? 1 : 0);
  stmt.finalize();
  res.status(201).json({ message: 'Lieu ajouté avec succès' });
});

app.get('/api/lieux', (req, res) => {
  db.all('SELECT * FROM lieux', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));

