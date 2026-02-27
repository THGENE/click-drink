
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [page, setPage] = useState('orders');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard Café – Click & Collect</h1>
        <nav style={{ marginBottom: 24 }}>
          <button onClick={() => setPage('orders')}>Commandes</button>
          <button onClick={() => setPage('products')}>Produits</button>
          <button onClick={() => setPage('schedules')}>Horaires</button>
          <button onClick={() => setPage('status')}>Statuts</button>
          <button onClick={() => setPage('square')}>Paiements Square</button>
        </nav>
        <main style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: '#222', borderRadius: 12, padding: 24, minHeight: 400 }}>
          {page === 'orders' && <OrdersPanel />}
          {page === 'products' && <ProductsPanel />}
          {page === 'schedules' && <SchedulesPanel />}
          {page === 'status' && <StatusPanel />}
          {page === 'square' && <SquarePayments />}
        </main>
      import SquarePayments from './pages/SquarePayments';
      </header>
    </div>
  );
}


// ...existing code...
import { io } from 'socket.io-client';

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/orders-with-items')
      .then(res => {
        if (!res.ok) throw new Error('Erreur API');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });

    // WebSocket : synchronisation statuts
    const socket = io('http://localhost:4000');
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      setOrders(orders => orders.map(order => order.id === parseInt(orderId) ? { ...order, status } : order));
    });
    return () => socket.disconnect();
  }, []);

  if (loading) return <div>Chargement des commandes…</div>;
  if (error) return <div style={{color:'red'}}>Erreur : {error}</div>;

  return (
    <div>
      <h2>📦 Commandes en direct</h2>
      {orders.length === 0 ? (
        <div>Aucune commande en cours.</div>
      ) : (
        <table style={{width:'100%',background:'#111',borderRadius:8}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Statut</th>
              <th>Heure de retrait</th>
              <th>Créée le</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <StatusChanger order={order} onStatusChange={() => window.location.reload()} />
                </td>
                <td>{order.pickup_time || '-'}</td>
                <td>{order.created_at}</td>
                <td>
                  {order.items && order.items.length > 0 ? (
                    <ul style={{margin:0,paddingLeft:16}}>
                      {order.items.map(item => (
                        <li key={item.id}>
                          <b>{item.product_name || 'Boisson'}</b>
                          {item.size && <> – {item.size}</>}
                          {item.milk && <> – {item.milk}</>}
                          {item.toppings && <> – Toppings: {item.toppings}</>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{color:'#888'}}>Aucun détail</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Composant pour changer le statut d'une commande
function StatusChanger({ order, onStatusChange }) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const statusOptions = ["à préparer", "en préparation", "prête", "retirée"];

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4000/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Erreur API");
      setLoading(false);
      onStatusChange && onStatusChange();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={status} onChange={handleChange} disabled={loading}>
        {statusOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && (<span style={{color:'red',marginLeft:8}}>Erreur : {error}</span>)}
    </div>
  );
}
                      {loading && <span style={{marginLeft:8}}>⏳</span>}
                      {error && <span style={{color:'red',marginLeft:8}}>Erreur : {error}</span>}
                    </div>
                  );
                }
                <td>{order.pickup_time || '-'}</td>
                <td>{order.created_at}</td>
                <td>
                  {order.items && order.items.length > 0 ? (
                    <ul style={{margin:0,paddingLeft:16}}>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>
                            <StatusChanger order={order} onStatusChange={() => window.location.reload()} />
                          </td>
                          <td>{order.pickup_time || '-'}</td>
                          <td>{order.created_at}</td>
                          <td>
                            {order.items && order.items.length > 0 ? (
                              <ul style={{margin:0,paddingLeft:16}}>
                                {order.items.map(item => (
                                  <li key={item.id}>
                                    <b>{item.product_name || 'Boisson'}</b>
                                    {item.size && <> – {item.size}</>}
                                    {item.milk && <> – {item.milk}</>}
                                    {item.toppings && <> – Toppings: {item.toppings}</>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{color:'#888'}}>Aucun détail</span>
                            )}
                          </td>
                        </tr>
                      ))}
function StatusPanel() {
  return <div>🔄 <b>Gestion des statuts</b> (à venir : à préparer, en préparation, prête, retirée...)</div>;
}

export default App;
