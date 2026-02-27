import React, { useState, useEffect } from 'react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    setFiltered(
      products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  return (
    <main className="products">
      <h2>Nos produits</h2>
      <input
        type="text"
        placeholder="Rechercher une boisson..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Recherche de produit"
      />
      <div className="product-list">
        {filtered.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.photo} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>{product.price} €</span>
            <button>Ajouter au panier</button>
          </div>
        ))}
      </div>
    </main>
  );
}
