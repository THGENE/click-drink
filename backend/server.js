// ...existing code...

// --- Début du backend propre ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
// Route racine pour vérifier le backend
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend Click & Drink !');
});

// Initialisation de la base de données
const db = new sqlite3.Database('./backend/clickdrink.db');

// Création des tables principales (commandes, produits, options, horaires, etc.)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    available INTEGER DEFAULT 1,
    stock INTEGER,
    photo TEXT,
    category TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    available INTEGER DEFAULT 1
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS product_options (
    product_id INTEGER,
    option_id INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(option_id) REFERENCES options(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT,
    pickup_time TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    size TEXT,
    milk TEXT,
    toppings TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT,
    open_time TEXT,
    close_time TEXT,
    pickup_start TEXT,
    pickup_end TEXT,
    closed INTEGER DEFAULT 0,
    pause_start TEXT,
    pause_end TEXT
  )`);
});

// --- ROUTES ET ENDPOINTS ---

// Endpoint pour récupérer toutes les commandes avec leurs items détaillés
app.get('/orders-with-items', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!orders.length) return res.json([]);
    const orderIds = orders.map(o => o.id);
    db.all(`SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`, orderIds, (err2, items) => {
      if (err2) return res.status(500).json({ error: err2.message });
      // Regroupe les items par commande
      const itemsByOrder = {};
      items.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });
      // Ajoute les items à chaque commande
      const result = orders.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || []
      }));
      res.json(result);
    });
  });
});

// Endpoint pour changer le statut d'une commande
app.patch('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Statut requis' });
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Commande non trouvée' });
    // Émission WebSocket
    io.emit('orderStatusChanged', { orderId: id, status });
    res.json({ success: true });
  });
});

// API de base (exemples)
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Endpoint horaires
app.get('/schedules', (req, res) => {
  res.json([
    { day: 'Lundi', open: '08:00', close: '18:00' },
    { day: 'Mardi', open: '08:00', close: '18:00' },
    { day: 'Mercredi', open: '08:00', close: '18:00' },
    { day: 'Jeudi', open: '08:00', close: '18:00' },
    { day: 'Vendredi', open: '08:00', close: '18:00' },
    { day: 'Samedi', open: '09:00', close: '16:00' },
    { day: 'Dimanche', open: null, close: null }
  ]);
});

// Endpoint statuts
app.get('/status', (req, res) => {
  res.json({ open: true, paused: false, closed: false });
});

// WebSocket pour commandes en temps réel
io.on('connection', (socket) => {
  console.log('Client connecté');
  // Ici, on pourra émettre les nouvelles commandes, changements de statuts, etc.
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Serveur backend click & collect sur http://localhost:${PORT}`);
});
