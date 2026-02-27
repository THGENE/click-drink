import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      setOrders(orders => orders.map(order => order.id === parseInt(orderId) ? { ...order, status } : order));
    });
    return () => socket.disconnect();
  }, []);

  if (loading) return <p>Chargement des commandes…</p>;
  if (error) return <p style={{color:'red'}}>Erreur : {error}</p>;

  return (
    <main className="orders">
      <h2>Commandes en cours</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
