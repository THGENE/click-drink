// ============================================================
//  Click & Drink — Backend serveur principal
//  v2 : authentification JWT par vendeur, temps réel, analytics
// ============================================================
require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const sqlite3    = require('sqlite3').verbose();
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';

const app    = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────
//  BASE DE DONNÉES
// ─────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || './clickdrink.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Erreur ouverture DB :', err.message);
  else     console.log('SQLite connecté :', DB_PATH);
});

db.serialize(() => {
  // ── Vendeurs (back-office) ──────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    bar_name      TEXT,
    email         TEXT,
    phone         TEXT,
    created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
  )`);

  // ── Produits ────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id   INTEGER REFERENCES vendors(id),
    name        TEXT,
    description TEXT,
    price       REAL,
    available   INTEGER DEFAULT 1,
    stock       INTEGER,
    photo       TEXT,
    category    TEXT
  )`);

  // ── Options produits ────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS options (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT,
    type      TEXT,
    available INTEGER DEFAULT 1
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS product_options (
    product_id INTEGER REFERENCES products(id),
    option_id  INTEGER REFERENCES options(id)
  )`);

  // ── Commandes ───────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id      INTEGER REFERENCES vendors(id),
    status         TEXT    DEFAULT 'en_attente',
    pickup_time    TEXT,
    client_name    TEXT,
    client_phone   TEXT,
    client_email   TEXT,
    total_price    REAL    DEFAULT 0,
    payment_method TEXT    DEFAULT 'sur_place',
    created_at     TEXT    DEFAULT CURRENT_TIMESTAMP
  )`);

  // ── Items de commande ───────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     INTEGER REFERENCES orders(id),
    product_id   INTEGER REFERENCES products(id),
    product_name TEXT,
    quantity     INTEGER DEFAULT 1,
    unit_price   REAL    DEFAULT 0,
    size         TEXT,
    milk         TEXT,
    toppings     TEXT
  )`);

  // ── Horaires ────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id    INTEGER REFERENCES vendors(id),
    day          TEXT,
    open_time    TEXT,
    close_time   TEXT,
    pickup_start TEXT,
    pickup_end   TEXT,
    closed       INTEGER DEFAULT 0,
    pause_start  TEXT,
    pause_end    TEXT
  )`);
});

// Migration douce : ajoute les colonnes manquantes sur tables existantes
function addColumnIfMissing(table, column, type, defaultVal) {
  db.all(`PRAGMA table_info(${table})`, [], (err, cols) => {
    if (err || !cols) return;
    if (!cols.some(c => c.name === column)) {
      const def = defaultVal !== undefined ? ` DEFAULT ${defaultVal}` : '';
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}${def}`, (e) => {
        if (e) console.warn(`Migration ${table}.${column} :`, e.message);
        else   console.log(`Colonne ajoutée : ${table}.${column}`);
      });
    }
  });
}
addColumnIfMissing('orders', 'vendor_id',      'INTEGER');
addColumnIfMissing('orders', 'client_name',    'TEXT');
addColumnIfMissing('orders', 'client_phone',   'TEXT');
addColumnIfMissing('orders', 'client_email',   'TEXT');
addColumnIfMissing('orders', 'total_price',    'REAL',  0);
addColumnIfMissing('orders', 'payment_method', 'TEXT',  "'sur_place'");
addColumnIfMissing('order_items', 'product_name', 'TEXT');
addColumnIfMissing('order_items', 'quantity',     'INTEGER', 1);
addColumnIfMissing('order_items', 'unit_price',   'REAL',    0);

// ─────────────────────────────────────────────────────────────
//  MIDDLEWARE JWT — sécurisation des routes vendeur
// ─────────────────────────────────────────────────────────────
function requireVendor(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.vendor = payload; // { id, username, bar_name }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS ANNULATION (webhook/SMS optionnel)
// ─────────────────────────────────────────────────────────────
async function notifyClientCancellation(order) {
  // Notification socket en temps réel côté client
  io.to(`order_${order.id}`).emit('orderCancelled', {
    orderId:     order.id,
    message:     'Votre commande a été annulée. Veuillez contacter le café pour plus d\'informations.',
    client_name: order.client_name,
  });

  // SMS via Twilio si configuré
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && order.client_phone) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Bonjour ${order.client_name || ''}, votre commande Click & Drink #${order.id} a été annulée. Contactez-nous : ${process.env.BAR_CONTACT_PHONE || ''}`,
        from: process.env.TWILIO_FROM_NUMBER,
        to:   order.client_phone,
      });
      console.log(`SMS annulation envoyé à ${order.client_phone}`);
    } catch (smsErr) {
      console.error('Erreur SMS Twilio :', smsErr.message);
    }
  }

  // Webhook générique si configuré (ex: n8n, Zapier, etc.)
  if (process.env.CANCEL_WEBHOOK_URL) {
    const axios = require('axios');
    axios.post(process.env.CANCEL_WEBHOOK_URL, {
      event:       'order_cancelled',
      orderId:     order.id,
      clientName:  order.client_name,
      clientPhone: order.client_phone,
      clientEmail: order.client_email,
    }).catch(e => console.error('Erreur webhook annulation :', e.message));
  }
}

// ─────────────────────────────────────────────────────────────
//  HELPER — requêtes SQL promisifiées
// ─────────────────────────────────────────────────────────────
const dbGet  = (sql, p=[]) => new Promise((res, rej) => db.get(sql, p, (e, r)  => e ? rej(e) : res(r)));
const dbAll  = (sql, p=[]) => new Promise((res, rej) => db.all(sql, p, (e, r)  => e ? rej(e) : res(r)));
const dbRun  = (sql, p=[]) => new Promise((res, rej) => db.run(sql, p, function(e){ e ? rej(e) : res(this); }));

// ─────────────────────────────────────────────────────────────
//  HELPER — enrichir commandes avec items
// ─────────────────────────────────────────────────────────────
async function ordersWithItems(orders) {
  if (!orders.length) return [];
  const ids = orders.map(o => o.id);
  const placeholders = ids.map(() => '?').join(',');
  const items = await dbAll(
    `SELECT oi.*, p.name AS product_name_ref
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id IN (${placeholders})`,
    ids
  );
  const byOrder = {};
  items.forEach(it => {
    if (!byOrder[it.order_id]) byOrder[it.order_id] = [];
    byOrder[it.order_id].push({ ...it, product_name: it.product_name || it.product_name_ref });
  });
  return orders.map(o => ({ ...o, items: byOrder[o.id] || [] }));
}

// ─────────────────────────────────────────────────────────────
//  ROUTE PUBLIQUE — santé du serveur
// ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '2.0', message: 'Click & Drink API' });
});

// ─────────────────────────────────────────────────────────────
//  AUTH VENDEUR
// ─────────────────────────────────────────────────────────────

// POST /vendor/register  (création d'un compte vendeur — à protéger en prod par ADMIN_SECRET)
app.post('/vendor/register', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (process.env.ADMIN_SECRET && adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Secret admin invalide' });
  }
  const { username, password, bar_name, email, phone } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username et password requis' });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await dbRun(
      'INSERT INTO vendors (username, password_hash, bar_name, email, phone) VALUES (?,?,?,?,?)',
      [username, hash, bar_name || '', email || '', phone || '']
    );
    res.status(201).json({ success: true, vendorId: result.lastID });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
    }
    res.status(500).json({ error: e.message });
  }
});

// POST /vendor/login
app.post('/vendor/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username et password requis' });
  }
  try {
    const vendor = await dbGet('SELECT * FROM vendors WHERE username = ?', [username]);
    if (!vendor) return res.status(401).json({ error: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(password, vendor.password_hash);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: vendor.id, username: vendor.username, bar_name: vendor.bar_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ token, vendor: { id: vendor.id, username: vendor.username, bar_name: vendor.bar_name, email: vendor.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /vendor/me
app.get('/vendor/me', requireVendor, async (req, res) => {
  try {
    const vendor = await dbGet('SELECT id, username, bar_name, email, phone, created_at FROM vendors WHERE id = ?', [req.vendor.id]);
    if (!vendor) return res.status(404).json({ error: 'Vendeur introuvable' });
    res.json(vendor);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  COMMANDES VENDEUR (sécurisées par JWT)
// ─────────────────────────────────────────────────────────────

// GET /vendor/orders  — toutes les commandes du vendeur avec items
app.get('/vendor/orders', requireVendor, async (req, res) => {
  const { status, date, limit = 50 } = req.query;
  try {
    let sql    = 'SELECT * FROM orders WHERE vendor_id = ?';
    const params = [req.vendor.id];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (date)   { sql += ' AND DATE(created_at) = ?'; params.push(date); }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));
    const orders = await dbAll(sql, params);
    res.json(await ordersWithItems(orders));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /vendor/orders/live  — commandes actives uniquement (excluant terminées)
app.get('/vendor/orders/live', requireVendor, async (req, res) => {
  const liveStatuses = ['en_attente', 'en_cours_preparation', 'commande_prete'];
  const placeholders = liveStatuses.map(() => '?').join(',');
  try {
    const orders = await dbAll(
      `SELECT * FROM orders WHERE vendor_id = ? AND status IN (${placeholders}) ORDER BY created_at DESC`,
      [req.vendor.id, ...liveStatuses]
    );
    res.json(await ordersWithItems(orders));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /vendor/orders/:id  — détail d'une commande
app.get('/vendor/orders/:id', requireVendor, async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND vendor_id = ?', [req.params.id, req.vendor.id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    const items = await dbAll(
      'SELECT oi.*, p.name AS product_name_ref FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order.id]
    );
    res.json({ ...order, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /vendor/orders/:id/status  — changer le statut d'une commande
const VALID_STATUSES = ['en_attente', 'en_cours_preparation', 'commande_prete', 'commande_retiree', 'commande_annulee'];

app.patch('/vendor/orders/:id/status', requireVendor, async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Statut requis' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(', ')}` });
  }

  try {
    // Vérifier que la commande appartient bien à ce vendeur
    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND vendor_id = ?', [id, req.vendor.id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Notification WebSocket : vendeur (room vendor_X) + client (room order_Y)
    io.to(`vendor_${req.vendor.id}`).emit('orderStatusChanged', { orderId: parseInt(id), status });
    io.to(`order_${id}`).emit('orderStatusChanged', { orderId: parseInt(id), status });

    // Annulation → notification automatique au client
    if (status === 'commande_annulee') {
      notifyClientCancellation(order);
    }

    res.json({ success: true, orderId: parseInt(id), status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /orders — création d'une commande par le client (public)
app.post('/orders', async (req, res) => {
  const { vendor_id, client_name, client_phone, client_email, pickup_time, items, total_price, payment_method } = req.body;
  if (!vendor_id || !items || !items.length) {
    return res.status(400).json({ error: 'vendor_id et items sont requis' });
  }
  try {
    // Vérifier que le vendeur existe
    const vendor = await dbGet('SELECT id FROM vendors WHERE id = ?', [vendor_id]);
    if (!vendor) return res.status(404).json({ error: 'Vendeur introuvable' });

    const result = await dbRun(
      `INSERT INTO orders (vendor_id, status, pickup_time, client_name, client_phone, client_email, total_price, payment_method)
       VALUES (?, 'en_attente', ?, ?, ?, ?, ?, ?)`,
      [vendor_id, pickup_time || null, client_name || '', client_phone || '', client_email || '', total_price || 0, payment_method || 'sur_place']
    );
    const orderId = result.lastID;

    for (const item of items) {
      await dbRun(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, size, milk, toppings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id || null, item.product_name || '', item.quantity || 1, item.unit_price || 0, item.size || '', item.milk || '', item.toppings || '']
      );
    }

    const newOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    const newItems = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const fullOrder = { ...newOrder, items: newItems };

    // Notification temps réel au vendeur
    io.to(`vendor_${vendor_id}`).emit('newOrder', fullOrder);

    res.status(201).json({ success: true, orderId, order: fullOrder });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  ANALYTICS VENDEUR (sécurisées par JWT)
// ─────────────────────────────────────────────────────────────

// GET /vendor/analytics?period=day|week|month
app.get('/vendor/analytics', requireVendor, async (req, res) => {
  const period = req.query.period || 'week';
  let dateFilter;
  switch (period) {
    case 'day':   dateFilter = "DATE(created_at) = DATE('now')"; break;
    case 'month': dateFilter = "created_at >= DATE('now', '-30 days')"; break;
    default:      dateFilter = "created_at >= DATE('now', '-7 days')";
  }

  try {
    const vid = req.vendor.id;

    // Chiffre d'affaires total & nombre de commandes
    const revenue = await dbGet(
      `SELECT COUNT(*) AS orders_count, COALESCE(SUM(total_price),0) AS total_revenue
       FROM orders
       WHERE vendor_id = ? AND ${dateFilter} AND status != 'commande_annulee'`,
      [vid]
    );

    // Panier moyen
    const avgBasket = revenue.orders_count > 0
      ? (revenue.total_revenue / revenue.orders_count).toFixed(2)
      : 0;

    // Chiffre d'affaires par jour
    const revenueByDay = await dbAll(
      `SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total_price),0) AS revenue
       FROM orders
       WHERE vendor_id = ? AND ${dateFilter} AND status != 'commande_annulee'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [vid]
    );

    // Top 10 produits vendus
    const topProducts = await dbAll(
      `SELECT oi.product_name, COALESCE(oi.product_id, 0) AS product_id,
              SUM(oi.quantity) AS total_qty, SUM(oi.quantity * oi.unit_price) AS total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.vendor_id = ? AND o.${dateFilter} AND o.status != 'commande_annulee'
       GROUP BY oi.product_name
       ORDER BY total_qty DESC
       LIMIT 10`,
      [vid]
    );

    // Heures de pointe (heure de création de commande)
    const peakHours = await dbAll(
      `SELECT CAST(strftime('%H', created_at) AS INTEGER) AS hour, COUNT(*) AS orders_count
       FROM orders
       WHERE vendor_id = ? AND ${dateFilter} AND status != 'commande_annulee'
       GROUP BY hour
       ORDER BY orders_count DESC`,
      [vid]
    );

    // Taux de no-show (commandes sur_place annulées / total sur_place)
    const noShowData = await dbGet(
      `SELECT
         COUNT(*) AS total_sur_place,
         SUM(CASE WHEN status = 'commande_annulee' THEN 1 ELSE 0 END) AS cancelled
       FROM orders
       WHERE vendor_id = ? AND ${dateFilter} AND payment_method = 'sur_place'`,
      [vid]
    );
    const noShowRate = noShowData.total_sur_place > 0
      ? ((noShowData.cancelled / noShowData.total_sur_place) * 100).toFixed(1)
      : 0;

    res.json({
      period,
      orders_count:  revenue.orders_count,
      avg_basket:    parseFloat(avgBasket),
      revenue_by_day: revenueByDay,
      top_products:   topProducts,
      peak_hours:     peakHours,
      no_show: {
        rate_percent:    parseFloat(noShowRate),
        total_sur_place: noShowData.total_sur_place,
        cancelled:       noShowData.cancelled,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  ROUTES PUBLIQUES MAINTENUES (compatibilité front client)
// ─────────────────────────────────────────────────────────────

app.get('/products', async (req, res) => {
  const { vendor_id } = req.query;
  try {
    const rows = vendor_id
      ? await dbAll('SELECT * FROM products WHERE vendor_id = ? AND available = 1', [vendor_id])
      : await dbAll('SELECT * FROM products WHERE available = 1', []);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/schedules', (req, res) => {
  res.json([
    { day: 'Lundi',    open: '08:00', close: '18:00' },
    { day: 'Mardi',    open: '08:00', close: '18:00' },
    { day: 'Mercredi', open: '08:00', close: '18:00' },
    { day: 'Jeudi',    open: '08:00', close: '18:00' },
    { day: 'Vendredi', open: '08:00', close: '18:00' },
    { day: 'Samedi',   open: '09:00', close: '16:00' },
    { day: 'Dimanche', open: null,    close: null    },
  ]);
});

app.get('/status', (req, res) => {
  res.json({ open: true, paused: false, closed: false });
});

// Rétrocompatibilité : liste des commandes sans auth (lecture seule, sans données sensibles)
app.get('/orders', async (req, res) => {
  try {
    const rows = await dbAll('SELECT id, status, pickup_time, created_at FROM orders ORDER BY created_at DESC LIMIT 100', []);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rétrocompatibilité : commandes avec items (sans auth)
app.get('/orders-with-items', async (req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100', []);
    res.json(await ordersWithItems(orders));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  INTÉGRATION POS SQUARE (optionnel)
// ─────────────────────────────────────────────────────────────
const posSquare = require('./pos_square');
app.get('/pos/square/payments', requireVendor, async (req, res) => {
  try {
    const data = await posSquare.listPayments();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  WEBSOCKET — salles par vendeur et par commande
// ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Le dashboard vendeur rejoint sa salle après login
  socket.on('joinVendorRoom', ({ token }) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.join(`vendor_${payload.id}`);
      socket.emit('vendorRoomJoined', { vendorId: payload.id });
      console.log(`Vendeur ${payload.username} connecté en temps réel`);
    } catch {
      socket.emit('authError', { message: 'Token invalide' });
    }
  });

  // Le client rejoint la salle de sa commande pour recevoir les mises à jour de statut
  socket.on('joinOrderRoom', ({ orderId }) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
    }
  });

  socket.on('disconnect', () => {
    // Nettoyage automatique par socket.io
  });
});

// ─────────────────────────────────────────────────────────────
//  DÉMARRAGE
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅  Click & Drink API v2 sur http://localhost:${PORT}`);
});
