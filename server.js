const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require("axios");
const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lieux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ville TEXT,
    adresse TEXT,
    codePostal TEXT,
    telephone TEXT,
    siteWeb TEXT,
    mail TEXT,
    nomLieu TEXT,
    type TEXT,
    animaux INTEGER,
    latitude REAL,
    longitude REAL
  )`);
});


app.post('/ajouter', async (req, res) => {
  const {
    ville, adresse, codePostal, telephone, siteWeb, mail, nomLieu,
    type, animaux
  } = req.body;
  console.log("→ Données reçues dans req.body :", req.body);

  const fullAddress = `${adresse}, ${codePostal} ${ville}, France`;
  let latitude = 46.603354, longitude = 1.888334; // Coordonnées par défaut (centre de la France)

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: fullAddress,
        format: "json",
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'Restaurants-Solidaires/1.0 (contact@example.com)' // modifiez l'email
      }
    });

    if (response.data.length > 0) {
      latitude = parseFloat(response.data[0].lat);
      longitude = parseFloat(response.data[0].lon);
    }
  } catch (error) {
    console.error("Erreur de géocodage :", error.message);
  }

  const stmt = db.prepare(`INSERT INTO lieux (
    ville, adresse, codePostal, telephone, siteWeb, mail, nomLieu,
    type, animaux, latitude, longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run([
    ville, adresse, codePostal, telephone, siteWeb, mail, nomLieu,
    type, animaux === "oui" ? 1 : 0, latitude, longitude
  ]);

  res.redirect('/index.html');
});


app.get('/api/lieux', (req, res) => {
  db.all('SELECT * FROM lieux', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));

