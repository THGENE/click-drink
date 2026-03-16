
import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import SquarePayments from './pages/SquarePayments';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// ─── Statuts commandes ───────────────────────────────────────────────────────
const STATUS_LABELS = {
  en_attente:            'En attente',
  en_cours_preparation:  'En cours de préparation',
  commande_prete:        'Commande prête ✓',
  commande_retiree:      'Commande retirée',
  commande_annulee:      'Commande annulée',
};
const STATUS_COLORS = {
  en_attente:            '#f59e0b',
  en_cours_preparation:  '#3b82f6',
  commande_prete:        '#22c55e',
  commande_retiree:      '#6b7280',
  commande_annulee:      '#ef4444',
};

function StatusBadge({ status }) {
  return (
    <span style={{
      background:   STATUS_COLORS[status] || '#888',
      color:        '#fff',
      borderRadius: 6,
      padding:      '3px 10px',
      fontSize:     13,
      fontWeight:   600,
      whiteSpace:   'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ─── Composant Login ─────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/vendor/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      onLogin(data.token, data.vendor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#111' }}>
      <div style={{ background:'#1e1e1e', borderRadius:12, padding:40, width:340, boxShadow:'0 8px 32px #0008' }}>
        <h2 style={{ color:'#f59e0b', textAlign:'center', marginBottom:28 }}>☕ Back-office vendeur</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ color:'#ccc', display:'block', marginBottom:6 }}>Identifiant</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            style={{ width:'100%', padding:'10px 12px', borderRadius:6, border:'1px solid #333', background:'#2a2a2a', color:'#fff', marginBottom:16, boxSizing:'border-box' }}
          />
          <label style={{ color:'#ccc', display:'block', marginBottom:6 }}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width:'100%', padding:'10px 12px', borderRadius:6, border:'1px solid #333', background:'#2a2a2a', color:'#fff', marginBottom:20, boxSizing:'border-box' }}
          />
          {error && <div style={{ color:'#f87171', marginBottom:12, fontSize:14 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width:'100%', padding:'12px 0', background: loading ? '#555' : '#f59e0b', color:'#000', fontWeight:700, borderRadius:6, border:'none', fontSize:15, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Panneau commandes EN DIRECT ─────────────────────────────────────────────
function LiveOrdersPanel({ token, vendorId }) {
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [notification,   setNotification]   = useState(null);

  const fetchLive = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/vendor/orders/live`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLive();
    const socket = io(API_URL, { transports: ['websocket'] });
    socket.emit('joinVendorRoom', { token });

    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
      setNotification(`🔔 Nouvelle commande #${order.id} de ${order.client_name || 'client'}`);
      setTimeout(() => setNotification(null), 6000);
    });
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      if (['commande_retiree', 'commande_annulee'].includes(status)) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    });
    return () => socket.disconnect();
  }, [token, fetchLive]);

  const changeStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/vendor/orders/${orderId}/status`, {
        method:  'PATCH',
        headers: authHeaders(token),
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  };

  if (loading) return <div style={{ color: '#ccc' }}>Chargement des commandes…</div>;
  if (error)   return <div style={{ color: '#f87171' }}>Erreur : {error}</div>;

  return (
    <div>
      <h2 style={{ color:'#f59e0b' }}>📡 Commandes en direct</h2>
      {notification && (
        <div style={{ background:'#22c55e', color:'#fff', borderRadius:8, padding:'10px 16px', marginBottom:16, fontWeight:600 }}>
          {notification}
        </div>
      )}
      {orders.length === 0 ? (
        <div style={{ color:'#888', textAlign:'center', padding:40 }}>Aucune commande active en ce moment</div>
      ) : (
        orders.map(order => <OrderCard key={order.id} order={order} onChangeStatus={changeStatus} />)
      )}
    </div>
  );
}

function OrderCard({ order, onChangeStatus }) {
  const TRANSITIONS = {
    en_attente:           ['en_cours_preparation', 'commande_annulee'],
    en_cours_preparation: ['commande_prete',        'commande_annulee'],
    commande_prete:       ['commande_retiree',       'commande_annulee'],
  };
  const actions = TRANSITIONS[order.status] || [];

  return (
    <div style={{ background:'#2a2a2a', borderRadius:10, padding:18, marginBottom:14, borderLeft:`4px solid ${STATUS_COLORS[order.status] || '#888'}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div>
          <b style={{ color:'#fff', fontSize:16 }}>Commande #{order.id}</b>
          {order.client_name && <span style={{ color:'#aaa', marginLeft:10 }}>{order.client_name}</span>}
          {order.client_phone && <span style={{ color:'#888', marginLeft:10, fontSize:13 }}>📞 {order.client_phone}</span>}
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div style={{ color:'#888', fontSize:13, marginTop:4 }}>
        {order.pickup_time && <span>⏰ Retrait : {order.pickup_time} &nbsp;|&nbsp;</span>}
        <span>💳 {order.payment_method === 'en_ligne' ? 'Payé en ligne' : 'Paiement sur place'}</span>
        {order.total_price > 0 && <span> &nbsp;|&nbsp; 💰 {parseFloat(order.total_price).toFixed(2)} €</span>}
        <span style={{ marginLeft:10, color:'#555' }}>{new Date(order.created_at).toLocaleTimeString('fr-FR')}</span>
      </div>
      {order.items && order.items.length > 0 && (
        <ul style={{ margin:'10px 0 12px 16px', color:'#ccc', fontSize:14 }}>
          {order.items.map(it => (
            <li key={it.id}>
              <b>{it.product_name || 'Produit'}</b>
              {it.quantity > 1 && <span style={{ color:'#f59e0b' }}> ×{it.quantity}</span>}
              {it.size    && <span> — {it.size}</span>}
              {it.milk    && <span> — {it.milk}</span>}
              {it.toppings && <span> — {it.toppings}</span>}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {actions.map(nextStatus => (
          <button
            key={nextStatus}
            onClick={() => onChangeStatus(order.id, nextStatus)}
            style={{
              padding:      '7px 16px',
              borderRadius: 6,
              border:       'none',
              background:   STATUS_COLORS[nextStatus] || '#555',
              color:        '#fff',
              fontWeight:   600,
              cursor:       'pointer',
              fontSize:     13,
            }}
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Panneau HISTORIQUE ───────────────────────────────────────────────────────
function HistoryPanel({ token }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [date,    setDate]    = useState('');
  const [status,  setStatus]  = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100 });
    if (date)   params.append('date',   date);
    if (status) params.append('status', status);
    try {
      const res  = await fetch(`${API_URL}/vendor/orders?${params}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [token, date, status]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div>
      <h2 style={{ color:'#f59e0b' }}>📋 Historique des commandes</h2>
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:6, border:'1px solid #444', background:'#2a2a2a', color:'#fff' }}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:6, border:'1px solid #444', background:'#2a2a2a', color:'#fff' }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={fetchHistory} style={{ padding:'8px 16px', borderRadius:6, background:'#f59e0b', color:'#000', fontWeight:700, border:'none', cursor:'pointer' }}>
          Filtrer
        </button>
      </div>
      {loading ? (
        <div style={{ color:'#ccc' }}>Chargement…</div>
      ) : orders.length === 0 ? (
        <div style={{ color:'#888', textAlign:'center', padding:30 }}>Aucune commande trouvée</div>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ color:'#888', textAlign:'left' }}>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>#</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Client</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Statut</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Total</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Paiement</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Date</th>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid #333' }}>Articles</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom:'1px solid #222' }}>
                <td style={{ padding:'8px 10px', color:'#fff' }}>{order.id}</td>
                <td style={{ padding:'8px 10px', color:'#ccc' }}>{order.client_name || '—'}</td>
                <td style={{ padding:'8px 10px' }}><StatusBadge status={order.status} /></td>
                <td style={{ padding:'8px 10px', color:'#f59e0b' }}>{order.total_price ? `${parseFloat(order.total_price).toFixed(2)} €` : '—'}</td>
                <td style={{ padding:'8px 10px', color:'#aaa' }}>{order.payment_method === 'en_ligne' ? 'En ligne' : 'Sur place'}</td>
                <td style={{ padding:'8px 10px', color:'#888', fontSize:12 }}>{new Date(order.created_at).toLocaleString('fr-FR')}</td>
                <td style={{ padding:'8px 10px', color:'#ccc' }}>
                  {order.items && order.items.length > 0
                    ? order.items.map(it => `${it.product_name || 'Produit'}${it.quantity > 1 ? ` ×${it.quantity}` : ''}`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Panneau ANALYTIQUES ─────────────────────────────────────────────────────
function AnalyticsPanel({ token }) {
  const [period,  setPeriod]  = useState('week');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchAnalytics = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/vendor/analytics?period=${p}`, { headers: authHeaders(token) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnalytics(period); }, [fetchAnalytics, period]);

  const handlePeriod = (p) => { setPeriod(p); fetchAnalytics(p); };

  if (loading) return <div style={{ color:'#ccc' }}>Chargement des analytiques…</div>;
  if (error)   return <div style={{ color:'#f87171' }}>Erreur : {error}</div>;
  if (!data)   return null;

  const maxRevenue = Math.max(...(data.revenue_by_day.map(d => d.revenue)), 1);
  const maxPeak    = Math.max(...(data.peak_hours.map(h => h.orders_count)), 1);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <h2 style={{ color:'#f59e0b', margin:0 }}>📊 Analytiques</h2>
        {['day','week','month'].map(p => (
          <button
            key={p}
            onClick={() => handlePeriod(p)}
            style={{ padding:'6px 16px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:700, background: period === p ? '#f59e0b' : '#333', color: period === p ? '#000' : '#ccc' }}
          >
            {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 derniers jours' : '30 derniers jours'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14, marginBottom:28 }}>
        <KpiCard label="Commandes"           value={data.orders_count}                                icon="📦" />
        <KpiCard label="Panier moyen"        value={`${data.avg_basket} €`}                           icon="🛒" />
        <KpiCard label="Taux de no-show"     value={`${data.no_show.rate_percent} %`}                 icon="🚫" sub={`${data.no_show.cancelled}/${data.no_show.total_sur_place} sur place`} />
      </div>

      {/* CA par jour */}
      {data.revenue_by_day.length > 0 && (
        <Section title="Chiffre d'affaires par jour">
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
            {data.revenue_by_day.map(d => (
              <div key={d.date} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, minWidth:30 }}>
                <span style={{ color:'#f59e0b', fontSize:11, marginBottom:4 }}>{parseFloat(d.revenue).toFixed(0)}€</span>
                <div style={{ background:'#f59e0b', width:'80%', height: Math.max(4, (d.revenue / maxRevenue) * 90), borderRadius:'4px 4px 0 0' }} />
                <span style={{ color:'#666', fontSize:10, marginTop:4 }}>{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
        {/* Top produits */}
        {data.top_products.length > 0 && (
          <Section title="Top produits">
            {data.top_products.slice(0, 8).map((p, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #333', color:'#ccc', fontSize:14 }}>
                <span><b style={{ color:'#f59e0b', marginRight:8 }}>#{i + 1}</b>{p.product_name || 'Inconnu'}</span>
                <span style={{ color:'#fff' }}>{p.total_qty} ventes</span>
              </div>
            ))}
          </Section>
        )}

        {/* Heures de pointe */}
        {data.peak_hours.length > 0 && (
          <Section title="Heures de pointe">
            <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:100 }}>
              {Array.from({ length: 24 }, (_, h) => {
                const found = data.peak_hours.find(ph => ph.hour === h);
                const count = found ? found.orders_count : 0;
                return (
                  <div key={h} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                    <div style={{ background: count > 0 ? '#3b82f6' : '#222', width:'100%', height: Math.max(2, (count / maxPeak) * 80), borderRadius:'2px 2px 0 0' }} />
                    {h % 4 === 0 && <span style={{ color:'#555', fontSize:9, marginTop:2 }}>{h}h</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ color:'#888', fontSize:12, marginTop:6 }}>
              Pic : {data.peak_hours[0] ? `${data.peak_hours[0].hour}h (${data.peak_hours[0].orders_count} cmd)` : '—'}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, sub }) {
  return (
    <div style={{ background:'#2a2a2a', borderRadius:10, padding:'16px 20px' }}>
      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
      <div style={{ color:'#f59e0b', fontSize:24, fontWeight:700 }}>{value}</div>
      <div style={{ color:'#888', fontSize:13, marginTop:2 }}>{label}</div>
      {sub && <div style={{ color:'#555', fontSize:11, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'#2a2a2a', borderRadius:10, padding:16 }}>
      <h3 style={{ color:'#f59e0b', marginBottom:12, fontSize:14 }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Panneau Produits (simplifié) ─────────────────────────────────────────────
function ProductsPanel({ token }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h2 style={{ color:'#f59e0b' }}>🛍 Produits</h2>
      {loading ? <div style={{ color:'#ccc' }}>Chargement…</div> : (
        products.length === 0
          ? <div style={{ color:'#888' }}>Aucun produit configuré</div>
          : <ul style={{ padding:0, listStyle:'none' }}>
              {products.map(p => (
                <li key={p.id} style={{ background:'#2a2a2a', borderRadius:8, padding:'12px 16px', marginBottom:8, color:'#ccc' }}>
                  <b style={{ color:'#fff' }}>{p.name}</b>
                  {p.price > 0 && <span style={{ float:'right', color:'#f59e0b', fontWeight:700 }}>{parseFloat(p.price).toFixed(2)} €</span>}
                  {p.description && <div style={{ color:'#777', fontSize:13, marginTop:4 }}>{p.description}</div>}
                </li>
              ))}
            </ul>
      )}
    </div>
  );
}

// ─── Application principale ──────────────────────────────────────────────────
function App() {
  const [token,  setToken]  = useState(() => localStorage.getItem('vendor_token') || null);
  const [vendor, setVendor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vendor_info') || 'null'); } catch { return null; }
  });
  const [page, setPage] = useState('live');

  const handleLogin = (t, v) => {
    localStorage.setItem('vendor_token', t);
    localStorage.setItem('vendor_info',  JSON.stringify(v));
    setToken(t);
    setVendor(v);
  };

  const handleLogout = () => {
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_info');
    setToken(null);
    setVendor(null);
    setPage('live');
  };

  if (!token || !vendor) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navBtn = (id, label) => (
    <button
      onClick={() => setPage(id)}
      style={{
        padding:      '8px 18px',
        borderRadius: 6,
        border:       'none',
        cursor:       'pointer',
        fontWeight:   700,
        background:   page === id ? '#f59e0b' : '#333',
        color:        page === id ? '#000'    : '#ccc',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background:'#111', minHeight:'100vh', color:'#fff', fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <span style={{ color:'#f59e0b', fontWeight:800, fontSize:18 }}>☕ Click & Drink</span>
          <span style={{ color:'#555', marginLeft:12, fontSize:14 }}>|</span>
          <span style={{ color:'#888', marginLeft:12, fontSize:14 }}>{vendor.bar_name || vendor.username}</span>
        </div>
        <nav style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {navBtn('live',      '📡 En direct')}
          {navBtn('history',   '📋 Historique')}
          {navBtn('analytics', '📊 Analytiques')}
          {navBtn('products',  '🛍 Produits')}
          {navBtn('square',    '💳 Square')}
          <button
            onClick={handleLogout}
            style={{ padding:'8px 18px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:700, background:'#3a1a1a', color:'#f87171' }}
          >
            Déconnexion
          </button>
        </nav>
      </header>

      {/* Contenu */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:24 }}>
        {page === 'live'      && <LiveOrdersPanel token={token} vendorId={vendor.id} />}
        {page === 'history'   && <HistoryPanel    token={token} />}
        {page === 'analytics' && <AnalyticsPanel  token={token} />}
        {page === 'products'  && <ProductsPanel   token={token} />}
        {page === 'square'    && <SquarePayments />}
      </main>
    </div>
  );
}

export default App;
