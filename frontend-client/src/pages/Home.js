  import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Tableau bars (exemple, ajoutez d'autres bars si besoin)
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
  },
  // Ajoutez d'autres bars ici si besoin
];

// Composant carte
function MapWithCustomMarkers({ bars }) {
  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: 320, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {bars.map(bar => (
        <Marker key={bar.id} position={[bar.lat, bar.lng]} icon={L.icon({ iconUrl: '/images/marker.png', iconSize: [32, 32] })}>
          <Popup>
            <strong>{bar.name}</strong><br />
            {bar.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Composant carte des filtres (exemple, à adapter selon vos besoins)
function MapFilters() {
  return (
    <div>
      {/* Ajoutez vos filtres ici */}
    </div>
  );
}

// Composant carte des bars
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
        {/* ...infos bar... */}
      </div>
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
            {/* ...autres infos... */}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant étape 2 (exemple, à adapter selon votre logique)
function Step2Base() {
  const [base, setBase] = useState('');
  const [milk, setMilk] = useState('');
  const [sugar, setSugar] = useState('');
  const [toppings, setToppings] = useState([]);
  // ...logique et UI...
  return (
    <div>
      {/* UI de personnalisation */}
    </div>
  );
}

// Composant principal Home
export default function Home() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [page, setPage] = useState(1);
  const barsPerPage = 5;
  const totalPages = Math.ceil(bars.length / barsPerPage);
  const paginatedBars = bars.slice((page - 1) * barsPerPage, page * barsPerPage);

  return (
    <main>
      <h1>Liste des bars</h1>
      <div style={{ display: 'flex', gap: 32 }}>
        <section style={{ flex: 2 }}>
          {paginatedBars.map(bar => (
            <BarCard key={bar.id} bar={bar} />
          ))}
          {/* Pagination conditionnelle */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>{'<'}</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i+1} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>{'>'}</button>
            </div>
          )}
        </section>
        <aside style={{ flex: 1 }}>
          <h3>Carte des tendances</h3>
          <MapFilters />
          <div style={{ width: '100%', height: 320 }}>
            <MapWithCustomMarkers bars={bars} />
          </div>
        </aside>
      </div>
      {/* Personnalisation boisson */}
      {selectedShop && <Step2Base />}
    </main>
  );
}