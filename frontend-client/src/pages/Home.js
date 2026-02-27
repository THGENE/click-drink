import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const bars = [
  {
    id: 1,
    name: 'Matcha & Co',
    address: '12 rue du Vertbois, 75003 Paris',
    arrondissement: '3',
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
    bases: ['Matcha latte chaud', 'Matcha latte glacé', 'Matcha latte oat', 'Matcha latte signature'],
    milks: ['Vache', 'Avoine', 'Amande', 'Coco'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {
      ...existing code...
    }
  },
  {
    id: 2,
    name: 'Café Kitsuné',
    address: '51 Galerie de Montpensier, 75001 Paris',
    arrondissement: '1',
    type: 'Café indépendant',
    price: '€€',
    rating: 9.2,
    reviews: 180,
    tags: ['Trendy', 'Japanese'],
    quote: 'Un café stylé au cœur du Palais Royal.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photo: '/images/kitsune.jpg',
    lat: 48.8655,
    lng: 2.3372,
    menu: [
      { name: 'Café Latte', price: '4.5€' },
      { name: 'Matcha Latte', price: '5€' },
      { name: 'Espresso', price: '3€' },
    ],
    hours: 'Lun-Dim : 08h30-18h',
    reviewsList: [
      { user: 'Paul', note: 9, text: 'Ambiance japonaise, très bon matcha.' },
      { user: 'Marie', note: 9, text: 'Lieu unique, café excellent.' },
    ],
    promo: '5% sur le matcha latte',
    bases: ['Matcha latte chaud', 'Matcha latte glacé'],
    milks: ['Vache', 'Avoine', 'Coco'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {
      ...existing code...
    }
  },
  // Ajoutez d'autres bars/cafés spécialisés avec arrondissement
];
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
        bases: ['Matcha latte chaud', 'Matcha latte glacé', 'Matcha latte oat', 'Matcha latte signature'],
        milks: ['Vache', 'Avoine', 'Amande', 'Coco'],
        sugars: ['0%', '30%', '50%', '100%'],
        toppingsCategories: {
          'Poudre et épices': ['Cacao en poudre', 'Cannelle', 'Vanille en poudre', 'Noix de muscade', 'Cardamome moulue', 'Gingembre en poudre', 'Sésame noir torréfié', 'Matcha', 'Espresso powder', 'Pumpkin spice', 'Chai spice mix', 'Cacao cru', 'Poudre de caramel'],
          'Saucres & drizzles': ['Caramel drizzle', 'Caramel beurre salé', 'Chocolat drizzle', 'Chocolat blanc drizzle', 'Noisette drizzle', 'Vanille drizzle', 'Sirop d’érable épais', 'Miel', 'Miel infusé', 'Sauce spéculoos', 'Sauce cookie butter', 'Sauce dulce de leche', 'Sauce crème brûlée'],
          'Mousses & crèmes': ['Cold foam vanille', 'Cold foam caramel', 'Cold foam noisette', 'Cold foam nature', 'Cold foam brown sugar', 'Cold foam crème brûlée', 'Cheese foam', 'Chantilly classique', 'Chantilly vanille', 'Chantilly caramel', 'Chantilly noisette', 'Chantilly spéculoos', 'Mousse de lait chaude', 'Mousse de lait froide', 'Crème fouettée aromatisée', 'Crème salée'],
          'Croustillants & gourmands': ['Cookie crumble', 'Speculoos crumble', 'Oreo crumble', 'Granola', 'Amandes effilées', 'Noisettes concassées', 'Noix caramélisées', 'Pépites de chocolat noir', 'Pépites de chocolat blanc', 'Pépites de caramel', 'Croustillant cacao', 'Croustillant café', 'Croustillant praliné', 'Céréales croustillantes', 'Marshmallows', 'Mini marshmallows', 'Chantilly + cacao', 'Chantilly + caramel', 'Chantilly + cookie crumble', 'Chantilly + cannelle', 'Chantilly + spéculoos', 'Crème brûlée topping', 'Meringue concassée', 'Nougatine'],
          'Aromatiques & zestes': ['Zeste d’orange', 'Zeste de citron', 'Zeste de yuzu', 'Écorces d’agrumes confites', 'Gingembre frais râpé', 'Menthe fraîche', 'Romarin flambé', 'Lavande séchée'],
          'Glacés': ['Cold foam aromatisé', 'Glaçons aromatisés', 'Cubes de lait glacé', 'Cubes de lait végétal glacé', 'Cubes de cold brew glacé', 'Crème glacée vanille', 'Crème glacée café', 'Soft serve vanille', 'Soft serve café'],
          'Healthy': ['Graines de chia', 'Graines de sésame', 'Graines de courge', 'Avoine croustillante', 'Granola sans sucre', 'Miel bio', 'Sirop d’agave', 'Purée d’amande', 'Purée de noisette', 'Purée de cacahuète', 'Cacao cru', 'Baies séchées'],
          'Fruits': ['Fraises fraîches', 'Framboises', 'Myrtilles', 'Banane tranchée', 'Orange confite', 'Citron confit', 'Pomme caramélisée', 'Poire pochée', 'Fruits rouges mixés'],
          'Signature': ['Brown sugar brûlé', 'Caramel brûlé', 'Honeycomb', 'Poudre de café torréfié', 'Praliné noisette', 'Praliné amande', 'Crème brûlée foam', 'Cookie dough topping', 'Spéculoos fondu', 'Pistache concassée', 'Pistache crème', 'Tahini caramel']
        }
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
export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [arrondissement, setArrondissement] = useState('all');
  const [page, setPage] = useState(1);
  const barsPerPage = 10;
  // Filtrer par arrondissement
  const filteredBars = arrondissement === 'all' ? bars : bars.filter(bar => bar.arrondissement === arrondissement);
  const totalPages = filteredBars.length > barsPerPage ? Math.ceil(filteredBars.length / barsPerPage) : 1;
  const paginatedBars = totalPages > 1 ? filteredBars.slice((page - 1) * barsPerPage, page * barsPerPage) : filteredBars;

  // Récupérer toutes les boissons proposées
  const allDrinks = Array.from(new Set(bars.flatMap(bar => bar.menu.map(item => item.name))));

  // Filtrer les bars selon la boisson sélectionnée
  React.useEffect(() => {
    if (!selectedDrink) {
      setFilteredBars(bars);
    } else {
      setFilteredBars(bars.filter(bar => bar.menu.some(item => item.name === selectedDrink)));
    }
  }, [selectedDrink]);
  return (
    <main className="home" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #fffbe6 0%, #b7e5c2 100%)' }}>
      <section className="hero" style={{ maxWidth: 600, textAlign: 'center', padding: '3rem 2rem', borderRadius: '2rem', background: '#fff', boxShadow: '0 8px 32px 0 #b7e5c244', marginBottom: '2rem' }}>
        <img src="/logo512.png" alt="Click & Drink" style={{ width: 80, marginBottom: 24, borderRadius: '1.5rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>Réservez, commandez, dégustez</h1>
        <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: 24 }}>
          Découvrez les meilleurs cafés, bars à matcha et coffee shops indépendants autour de vous.<br />
          Commandez en ligne, gagnez du temps, vivez l’expérience Click & Drink.
        </p>
        <form style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }} onSubmit={e => { e.preventDefault(); window.location.href = `/products?search=${encodeURIComponent(search)}`; }}>
          <input
            type="text"
            placeholder="Rechercher un établissement, une boisson..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid #b7e5c2', fontSize: '1.1rem', width: 260 }}
            aria-label="Recherche"
          />
          <button type="submit" style={{ background: 'linear-gradient(90deg, #b7e5c2 0%, #43a047 100%)', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.8rem 2rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Rechercher
          </button>
        </form>
        <div style={{ color: '#888', fontSize: '1rem', marginBottom: 8 }}>
          <span role="img" aria-label="localisation">📍</span> Paris, Lyon, Bordeaux, Marseille, Lille...
        </div>
        <div style={{ marginTop: 24, color: '#43a047', fontWeight: 600, fontSize: '1.1rem' }}>
          <span role="img" aria-label="éclair">⚡</span> Commande rapide, paiement sécurisé, retrait express !
        </div>
      </section>
      <section style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#555', fontSize: '1.1rem' }}>
        <p>
          <strong>Click & Drink</strong> révolutionne la commande dans les coffee shops et bars à matcha : <br />
          <span style={{ color: '#43a047' }}>plus d’attente, plus de simplicité, plus de plaisir.</span>
        </p>
      </section>
      {/* Ajout du menu défilant, carte et filtre boissons + sélection du shop */}
      {!selectedShop ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 0' }}>
          <section style={{ flex: 2, maxWidth: 700 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Bars à matcha & cafés tendances à Paris</h2>
            <div style={{ marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#43a047', fontSize: '1.1rem' }}>Arrondissement :</span>
              <select value={arrondissement} onChange={e => { setArrondissement(e.target.value); setPage(1); }} style={{ borderRadius: 8, padding: '6px 18px', fontSize: '1rem', border: '1px solid #b7e5c2', background: '#fff', color: '#43a047', fontWeight: 600 }}>
                <option value="all">Tous</option>
                {[...new Set(bars.map(bar => bar.arrondissement))].sort().map(num => (
                  <option key={num} value={num}>{num}e</option>
                ))}
              </select>
            </div>
            {paginatedBars.length === 0 ? (
              <div style={{ color: '#e53935', fontWeight: 600, fontSize: '1.1rem', marginBottom: 24 }}>Aucun bar dans cet arrondissement.</div>
            ) : (
              paginatedBars.map(bar => (
                <div key={bar.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedShop(bar)}>
                  <BarCard bar={bar} />
                  <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Choisir ce shop</button>
                </div>
              ))
            )}
            {/* Pagination conditionnelle */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', background: '#b7e5c2', color: '#43a047', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>{'<'}</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i+1} onClick={() => setPage(i+1)} style={{ borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', background: page === i+1 ? '#43a047' : '#b7e5c2', color: page === i+1 ? '#fff' : '#43a047', border: 'none', cursor: 'pointer' }}>{i+1}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: '1rem', background: '#b7e5c2', color: '#43a047', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>{'>'}</button>
              </div>
            )}
          </section>
          <aside style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #b7e5c244', padding: 18, height: 'fit-content', position: 'sticky', top: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Carte des tendances</h3>
            <MapFilters />
            <div style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
              <MapWithCustomMarkers bars={filteredBars} />
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #b7e5c244', padding: 32 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Personnalisez votre boisson chez {selectedShop.name}</h2>
          {/* Étape 2 : choix de la base matcha latte */}
          <Step2Base />
          <button style={{ marginTop: 18, background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setSelectedShop(null)}>Retour à la sélection des shops</button>
        </div>
      )}

// Composant étape 2 et 3 : choix de la base matcha latte puis du lait
function Step2Base() {
  const [base, setBase] = useState('');
  const [milk, setMilk] = useState('');
  const [sugar, setSugar] = useState('');
  const [toppings, setToppings] = useState([]);
  const bases = [
    'Matcha latte chaud',
    'Matcha latte glacé',
    'Matcha latte oat',
    'Matcha latte signature',
  ];
  const milks = [
    'Vache',
    'Avoine',
    'Amande',
    'Coco',
  ];
  const sugars = ['0%', '30%', '50%', '100%'];
  // Toppings multi-catégories
  const toppingsCategories = {
    'Poudre et épices': [
      'Cacao en poudre', 'Cannelle', 'Vanille en poudre', 'Noix de muscade', 'Cardamome moulue', 'Gingembre en poudre', 'Sésame noir torréfié', 'Matcha (pour cafés hybrides)', 'Espresso powder (poudre de café concentré)', 'Pumpkin spice', 'Chai spice mix', 'Cacao cru', 'Poudre de caramel'
    ],
    'Saucres & drizzles': [
      'Caramel drizzle', 'Caramel beurre salé', 'Chocolat drizzle', 'Chocolat blanc drizzle', 'Noisette drizzle', 'Vanille drizzle', 'Sirop d’érable épais', 'Miel', 'Miel infusé (lavande, vanille, cannelle)', 'Sauce spéculoos', 'Sauce cookie butter', 'Sauce dulce de leche', 'Sauce crème brûlée'
    ],
    'Mousses & crèmes': [
      'Cold foam (vanille, caramel, noisette, nature)', 'Cold foam brown sugar', 'Cold foam crème brûlée', 'Cheese foam (style bubble tea premium)', 'Chantilly classique', 'Chantilly vanille', 'Chantilly caramel', 'Chantilly noisette', 'Chantilly spéculoos', 'Mousse de lait chaude', 'Mousse de lait froide', 'Crème fouettée aromatisée', 'Crème salée (salted cream)'
    ],
    'Croustillants & gourmands': [
      'Cookie crumble', 'Speculoos crumble', 'Oreo crumble', 'Granola', 'Amandes effilées', 'Noisettes concassées', 'Noix caramélisées', 'Pépites de chocolat noir', 'Pépites de chocolat blanc', 'Pépites de caramel', 'Croustillant cacao', 'Croustillant café', 'Croustillant praliné', 'Céréales croustillantes (cornflakes, avoine toastée)', 'Marshmallows', 'Mini marshmallows', 'Chantilly + cacao', 'Chantilly + caramel', 'Chantilly + cookie crumble', 'Chantilly + cannelle', 'Chantilly + spéculoos', 'Crème brûlée topping (sucre caramélisé)', 'Meringue concassée', 'Nougatine'
    ],
    'Aromatiques & zestes': [
      'Zeste d’orange', 'Zeste de citron', 'Zeste de yuzu', 'Écorces d’agrumes confites', 'Gingembre frais râpé', 'Menthe fraîche', 'Romarin flambé', 'Lavande séchée'
    ],
    'Glacés': [
      'Cold foam aromatisé', 'Glaçons aromatisés (café, vanille, caramel)', 'Cubes de lait glacé', 'Cubes de lait végétal glacé', 'Cubes de cold brew glacé', 'Crème glacée vanille (affogato style)', 'Crème glacée café', 'Soft serve vanille', 'Soft serve café'
    ],
    'Healthy': [
      'Graines de chia', 'Graines de sésame', 'Graines de courge', 'Avoine croustillante', 'Granola sans sucre', 'Miel bio', 'Sirop d’agave', 'Purée d’amande', 'Purée de noisette', 'Purée de cacahuète', 'Cacao cru', 'Baies séchées (cranberries, myrtilles)'
    ],
    'Fruits': [
      'Fraises fraîches', 'Framboises', 'Myrtilles', 'Banane tranchée', 'Orange confite', 'Citron confit', 'Pomme caramélisée', 'Poire pochée', 'Fruits rouges mixés (topping coulis)'
    ],
    'Signature': [
      'Brown sugar brûlé', 'Caramel brûlé', 'Honeycomb (nid d’abeille croustillant)', 'Poudre de café torréfié', 'Praliné noisette', 'Praliné amande', 'Crème brûlée foam', 'Cookie dough topping', 'Spéculoos fondu', 'Pistache concassée', 'Pistache crème', 'Tahini caramel'
    ]
  };
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Étape 2 : Choisissez la base</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {bases.map(b => (
          <button
            key={b}
            style={{
              background: base === b ? '#43a047' : '#b7e5c2',
              color: base === b ? '#fff' : '#43a047',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #b7e5c244',
              transition: 'background 0.2s',
            }}
            onClick={() => setBase(b)}
          >
            {b}
          </button>
        ))}
      </div>
      {base && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: '#43a047', fontWeight: 600, marginBottom: 18 }}>Base sélectionnée : {base}</div>
          <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Étape 3 : Choisissez le lait</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            {milks.map(m => (
              <button
                key={m}
                style={{
                  background: milk === m ? '#43a047' : '#b7e5c2',
                  color: milk === m ? '#fff' : '#43a047',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #b7e5c244',
                  transition: 'background 0.2s',
                }}
                onClick={() => setMilk(m)}
              >
                {m}
              </button>
            ))}
          </div>
          {milk && (
            <div style={{ marginTop: 18 }}>
              <div style={{ color: '#43a047', fontWeight: 600, marginBottom: 18 }}>Lait sélectionné : {milk}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Étape 4 : Choisissez le pourcentage de sucre</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                {sugars.map(s => (
                  <button
                    key={s}
                    style={{
                      background: sugar === s ? '#43a047' : '#b7e5c2',
                      color: sugar === s ? '#fff' : '#43a047',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 28px',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px #b7e5c244',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => setSugar(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sugar && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: '#43a047', fontWeight: 600, marginBottom: 18 }}>Sucre sélectionné : {sugar}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Étape 5 : Choisissez vos toppings</h3>
                  {Object.entries(toppingsCategories).map(([cat, items]) => (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, color: '#43a047', marginBottom: 8 }}>{cat}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {items.map(item => (
                          <button
                            key={item}
                            style={{
                              background: toppings.includes(item) ? '#43a047' : '#b7e5c2',
                              color: toppings.includes(item) ? '#fff' : '#43a047',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 18px',
                              fontWeight: 600,
                              fontSize: '1rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px #b7e5c244',
                              transition: 'background 0.2s',
                            }}
                            onClick={() => setToppings(toppings => toppings.includes(item) ? toppings.filter(t => t !== item) : [...toppings, item])}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {toppings.length > 0 && (
                    <div style={{ marginTop: 18, color: '#43a047', fontWeight: 600 }}>
                      Toppings sélectionnés : {toppings.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
    </main>
  );
}
