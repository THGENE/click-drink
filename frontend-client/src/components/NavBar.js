import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/">Accueil</Link>
      <Link to="/trending">Tendances</Link>
      <Link to="/products">Produits</Link>
      <Link to="/orders">Commandes</Link>
      <Link to="/cart">Panier</Link>
    </nav>
  );
}
