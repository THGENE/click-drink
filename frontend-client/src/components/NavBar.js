import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ background: '#222', color: '#fff', padding: '12px 24px', display: 'flex', gap: 24, alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold', fontSize: 20 }}>ClickDrink</span>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Accueil</Link>
      <Link to="/cart" style={{ color: '#fff', textDecoration: 'none' }}>Panier</Link>
      <Link to="/orders" style={{ color: '#fff', textDecoration: 'none' }}>Commandes</Link>
    </nav>
  );
}
