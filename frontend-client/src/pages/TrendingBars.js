import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const bars = [
  {
    id: 1,
    name: 'Matcha & Co',
    address: '12 rue du Vertbois, 75003 Paris',
    type: 'Matcha Bar',
    price: '€€',
    rating: 9.6,
    reviews: 210,
    tags: ['Vegan', 'Healthy'],
    quote: 'Le meilleur matcha de Paris, ambiance zen et déco épurée.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photo: '/images/matcha-co.jpg',
    lat: 48.8675,
    lng: 2.3572,
    menu: [
      { name: 'Matcha Latte', price: '5€' },
      { name: 'Matcha Cake', price: '4€' },
      { name: 'Iced Matcha', price: '5.5€' },
    ],
    hours: 'Lun-Dim : 08h30-18h',
    reviewsList: [
      { user: 'Sophie', note: 10, text: 'Un matcha parfait, déco sublime !' },
      { user: 'Alex', note: 9, text: 'Service rapide et ambiance zen.' },
    ],
    promo: '10% sur le brunch dimanche',
  },
  // Ajoutez d'autres bars ici si besoin
];

function BarCard({ bar }) {
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        background: hovered ? '#f7f7f7' : '#fff',
        borderRadius: 18,
        boxShadow: hovered ? '0 8px 32px #b7e5c299' : '0 4px 24px #b7e5c299',
        marginBottom: 28,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 160,
        transition: 'background 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setShowPopup(true)}
    >
      <img src={bar.photo} alt={bar.name} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: '18px 0 0 18px' }} />
      <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: '1.3rem', color: '#222' }}>{bar.name}</span>
            <span style={{ background: '#43a047', color: '#fff', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '1.1rem' }}>{bar.rating} ★</span>
            <span style={{ color: '#888', fontSize: '0.95rem' }}>({bar.reviews})</span>
            {bar.type === 'Matcha Bar' && <span style={{ background: '#b7e5c2', color: '#43a047', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '0.95rem', marginLeft: 6 }}>Matcha Bar</span>}
            {bar.type === 'Café indépendant' && <span style={{ background: '#ffe0b2', color: '#ff9800', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '0.95rem', marginLeft: 6 }}>Café indépendant</span>}
            <span
              style={{ marginLeft: 12, cursor: 'pointer', fontSize: '1.3rem', color: fav ? '#e53935' : '#bbb', transition: 'color 0.2s' }}
              onClick={e => { e.stopPropagation(); setFav(f => !f); }}
              title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {fav ? '♥' : '♡'}
            </span>
          </div>
          <div style={{ color: '#555', fontSize: '1rem', marginBottom: 4 }}>{bar.address}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            {bar.tags.map(tag => (
              <span key={tag} style={{ background: '#e8f5e9', color: '#43a047', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
          <div style={{ color: '#222', fontStyle: 'italic', marginBottom: 8, fontSize: '1.05rem' }}>
            “{bar.quote}”
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Horaires : </span>
            <span style={{ color: '#555', fontSize: '1rem' }}>{bar.hours}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Menu : </span>
            {bar.menu.map(item => (
              <span key={item.name} style={{ background: '#e8f5e9', color: '#43a047', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600, marginRight: 6 }}>{item.name} {item.price}</span>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#fbc02d', fontSize: '1rem' }}>Promo : </span>
            <span style={{ color: '#ff9800', fontSize: '1rem' }}>{bar.promo}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Avis : </span>
            {bar.reviewsList.map(r => (
              <span key={r.user} style={{ background: '#fffde7', color: '#fbc02d', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600, marginRight: 6 }}>{r.user} ({r.note}/10) : {r.text}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {bar.slots.map(slot => (
            <button key={slot} style={{ background: 'linear-gradient(90deg,#43a047,#b7e5c2)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #b7e5c244', transition: 'background 0.2s' }}>{slot}</button>
          ))}
        </div>
      </div>
      <span style={{ position: 'absolute', top: 12, right: 12, background: '#fffde7', color: '#fbc02d', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 2px 8px #b7e5c244' }}>Premium</span>
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px #b7e5c299', padding: 32, minWidth: 320, maxWidth: 420 }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 12 }}>{bar.name}</h4>
            <img src={bar.photo} alt={bar.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
            <div style={{ color: '#555', fontSize: '1rem', marginBottom: 8 }}>{bar.address}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {bar.tags.map(tag => (
                <span key={tag} style={{ background: '#e8f5e9', color: '#43a047', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <div style={{ color: '#222', fontStyle: 'italic', marginBottom: 8, fontSize: '1.05rem' }}>
              “{bar.quote}”
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Horaires : </span>
              <span style={{ color: '#555', fontSize: '1rem' }}>{bar.hours}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Menu : </span>
              {bar.menu.map(item => (
                <span key={item.name} style={{ background: '#e8f5e9', color: '#43a047', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600, marginRight: 6 }}>{item.name} {item.price}</span>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#fbc02d', fontSize: '1rem' }}>Promo : </span>
              <span style={{ color: '#ff9800', fontSize: '1rem' }}>{bar.promo}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1rem' }}>Avis : </span>
              {bar.reviewsList.map(r => (
                <span key={r.user} style={{ background: '#fffde7', color: '#fbc02d', borderRadius: 8, padding: '2px 10px', fontSize: '0.95rem', fontWeight: 600, marginRight: 6 }}>{r.user} ({r.note}/10) : {r.text}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {bar.slots.map(slot => (
                <button key={slot} style={{ background: 'linear-gradient(90deg,#43a047,#b7e5c2)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #b7e5c244', transition: 'background 0.2s' }}>{slot}</button>
              ))}
            </div>
            <button style={{ marginTop: 18, background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setShowPopup(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapWithCustomMarkers({ bars }) {
  const matchaIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const cafeIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3075/3075976.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  return (
    <MapContainer center={[48.864716, 2.349014]} zoom={12.5} style={{ width: '100%', height: 320 }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bars.map(bar => (
        <Marker
          key={bar.id}
          position={[bar.lat, bar.lng]}
          icon={bar.type === 'Matcha Bar' ? matchaIcon : cafeIcon}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{bar.name}</strong><br />
              <span style={{ fontSize: '0.95rem' }}>{bar.address}</span><br />
              <span style={{ color: '#43a047', fontWeight: 700 }}>{bar.rating} ★</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function MapFilters() {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <button style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Tous</button>
      <button style={{ background: '#b7e5c2', color: '#43a047', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Matcha Bars</button>
      <button style={{ background: '#ffe0b2', color: '#ff9800', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Cafés indépendants</button>
    </div>
  );
}

export default function TrendingBars() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 0' }}>
      <section style={{ flex: 2, maxWidth: 700 }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Bars à matcha & cafés tendances à Paris</h2>
        {bars.map(bar => (
          <BarCard key={bar.id} bar={bar} />
        ))}
      </section>
      <aside style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #b7e5c244', padding: 18, height: 'fit-content' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Carte des tendances</h3>
        <MapFilters />
        <div style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
          <MapWithCustomMarkers bars={bars} />
        </div>
      </aside>
    </div>
  );
}

