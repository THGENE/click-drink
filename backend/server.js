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

// WebSocket pour commandes en temps réel
io.on('connection', (socket) => {
  console.log('Client connecté');
  // Ici, on pourra émettre les nouvelles commandes, changements de statuts, etc.
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Serveur backend click & collect sur http://localhost:${PORT}`);
});
