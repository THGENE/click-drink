import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import NavBar from '../components/NavBar';
import MapFilters from '../components/MapFilters';
import MapWithCustomMarkers from '../components/MapWithCustomMarkers';
import Step2Base from '../components/Step2Base';

// Bars à matcha et cafés indépendants issus des articles du Bonbon
const bars = [{
          id: 1,
          name: 'Les Crèmes',
          address: 'Adresse à compléter',
          arrondissement: '',
          type: 'Coffee Shop',
          price: '€€',
          rating: 9.1,
          reviews: 100,
          tags: ['Café', 'Ambiance', 'Spécialités'],
          quote: 'Un coffee shop gourmand, parfait pour savourer des crèmes et douceurs maison.',
          slots: ['09:00', '09:30', '10:00', '10:30'],
          photos: [
            '/images/cremes-cadre.jpg',
            '/images/cremes-produit1.jpg',
            '/images/cremes-produit2.jpg'
          ],
          videos: [
            '/videos/cremes-ambiance.mp4'
          ],
          lat: 48.8667,
          lng: 2.3631,
          menu: [
            { name: 'Crème café', price: '5€' },
            { name: 'Pâtisserie maison', price: '4.5€' },
            { name: 'Iced Coffee', price: '5.5€' },
          ],
          hours: 'Lun-Dim : 09h-18h',
          reviewsList: [
            { user: 'Nina', note: 10, text: 'Des crèmes délicieuses, ambiance cosy !' },
            { user: 'Max', note: 9, text: 'Super accueil, produits gourmands.' },
          ],
          promo: '',
          bases: ['Crème café', 'Café latte chaud'],
          milks: ['Vache', 'Avoine', 'Amande'],
          sugars: ['0%', '30%', '50%', '100%'],
          toppingsCategories: {},
          link: 'https://www.instagram.com/lescremesparis/'
        },
      {
        id: 2,
        name: 'Bingsutt',
        address: 'Adresse à compléter',
        arrondissement: '',
        type: 'Coffee Shop',
        price: '€€',
        rating: 9.2,
        reviews: 110,
        tags: ['Café', 'Ambiance', 'Spécialités'],
        quote: 'Un coffee shop à l’ambiance unique, parfait pour découvrir des saveurs originales.',
        slots: ['09:00', '09:30', '10:00', '10:30'],
        photos: [
          '/images/bingsutt-cadre.jpg',
          '/images/bingsutt-produit1.jpg',
          '/images/bingsutt-produit2.jpg'
        ],
        lat: 48.8667,
        lng: 2.3631,
        menu: [
          { name: 'Café Latte', price: '5€' },
          { name: 'Pâtisserie maison', price: '4.5€' },
          { name: 'Iced Coffee', price: '5.5€' },
        ],
        hours: 'Lun-Dim : 09h-18h',
        reviewsList: [
          { user: 'Sophie', note: 10, text: 'Un lieu original, produits délicieux !' },
          { user: 'Alex', note: 9, text: 'Ambiance dépaysante, staff très sympa.' },
        ],
        promo: '',
        bases: ['Café latte chaud', 'Café latte glacé'],
        milks: ['Vache', 'Avoine', 'Amande'],
        sugars: ['0%', '30%', '50%', '100%'],
        toppingsCategories: {},
        link: 'https://www.instagram.com/bingsutt.paris/'
      },
    {
      id: 3,
      name: 'Kapé',
      address: 'Adresse à compléter',
      arrondissement: '',
      type: 'Coffee Shop',
      price: '€€',
      rating: 9.3,
      reviews: 120,
      tags: ['Café', 'Ambiance', 'Spécialités'],
      quote: 'Un coffee shop chaleureux, parfait pour découvrir des saveurs originales.',
      slots: ['09:00', '09:30', '10:00', '10:30'],
      photos: [
        '/images/kape-cadre.jpg',
        '/images/kape-produit1.jpg',
        '/images/kape-produit2.jpg'
      ],
      videos: [
        '/videos/kape-video.mp4'
      ],
      lat: 48.8667,
      lng: 2.3631,
      menu: [
        { name: 'Café Latte', price: '5€' },
        { name: 'Pâtisserie maison', price: '4.5€' },
        { name: 'Iced Coffee', price: '5.5€' },
      ],
      hours: 'Lun-Dim : 09h-18h',
      reviewsList: [
        { user: 'Julie', note: 10, text: 'Un café original, ambiance très sympa !' },
        { user: 'Antoine', note: 9, text: 'Découverte de saveurs, staff accueillant.' },
      ],
      promo: '',
      bases: ['Café latte chaud', 'Café latte glacé'],
      milks: ['Vache', 'Avoine', 'Amande'],
      sugars: ['0%', '30%', '50%', '100%'],
      toppingsCategories: {},
      link: 'https://www.instagram.com/kapeparis/'
    },
  {
    id: 4,
    name: 'Umami Matcha Café',
    address: '22 Rue Béranger, 75003 Paris',
    arrondissement: '3',
    type: 'Matcha Bar',
    price: '€€',
    rating: 9.5,
    reviews: 180,
    tags: ['Matcha', 'Japonais', 'Healthy'],
    quote: 'Le spot incontournable pour les amateurs de matcha, ambiance zen et pâtisseries japonaises.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photos: ['/images/umami-matcha.jpg', '/images/umami-matcha-produit1.jpg', '/images/umami-matcha-produit2.jpg'],
    lat: 48.8667,
    lng: 2.3631,
    menu: [
      { name: 'Matcha Latte', price: '5€' },
      { name: 'Dorayaki', price: '4.5€' },
      { name: 'Iced Matcha', price: '5.5€' },
    ],
    hours: 'Lun-Dim : 09h-18h',
    reviewsList: [
      { user: 'Marie', note: 10, text: 'Un vrai voyage au Japon, matcha délicieux !' },
      { user: 'Lucas', note: 9, text: 'Ambiance très zen, pâtisseries originales.' },
    ],
    promo: '',
    bases: ['Matcha latte chaud', 'Matcha latte glacé'],
    milks: ['Vache', 'Avoine', 'Amande'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {},
    link: 'https://www.lebonbon.fr/paris/pepites/coffee-shop-matcha-savourer-tatamis-2e-paris/'
  },
  {
    id: 5,
    name: 'Brown Coffee Shop',
    address: 'Adresse à compléter',
    arrondissement: '',
    type: 'Coffee Shop',
    price: '€€',
    rating: 9.4,
    reviews: 150,
    tags: ['Café', 'Ambiance', 'Spécialités'],
    quote: 'Un coffee shop convivial, parfait pour savourer des boissons et douceurs maison.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photos: ['/images/brown-cadre.jpg', '/images/brown-produit.jpg'],
    videos: ['/videos/brown-ambiance.mp4'],
    lat: 48.8667,
    lng: 2.3631,
    menu: [
      { name: 'Café Latte', price: '5€' },
      { name: 'Pâtisserie maison', price: '4.5€' },
      { name: 'Iced Coffee', price: '5.5€' },
    ],
    hours: 'Lun-Dim : 09h-18h',
    reviewsList: [
      { user: 'Emma', note: 10, text: 'Un café chaleureux, ambiance top !' },
    ],
    promo: '',
    bases: ['Café latte chaud', 'Café latte glacé'],
    milks: ['Vache', 'Avoine', 'Amande'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {},
    link: 'https://www.instagram.com/browncoffeeshop/'
  },
  {
    id: 6,
    name: 'Café Nuances',
    address: 'Adresse à compléter',
    arrondissement: '',
    type: 'Coffee Shop',
    price: '€€',
    rating: 9.0,
    reviews: 80,
    tags: ['Café', 'Ambiance', 'Spécialités'],
    quote: 'Un café parisien moderne, parfait pour découvrir des nuances de saveurs.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photos: [
      '/images/nuances-photo1.jpg',
      '/images/nuances-photo2.jpg',
      '/images/nuances-photo3.jpg',
      '/images/nuances-photo4.jpg',
      '/images/nuances-photo5.jpg',
      '/images/nuances-photo6.jpg'
    ],
    lat: 48.8667,
    lng: 2.3631,
    menu: [
      { name: 'Café Nuances', price: '5€' },
      { name: 'Pâtisserie maison', price: '4.5€' },
      { name: 'Iced Coffee', price: '5.5€' },
    ],
    hours: 'Lun-Dim : 09h-18h',
    reviewsList: [
      { user: 'Paul', note: 10, text: 'Un café unique, ambiance moderne !' },
      { user: 'Léa', note: 9, text: 'Découverte de saveurs, staff accueillant.' },
    ],
    promo: '',
    bases: ['Café nuances chaud', 'Café nuances glacé'],
    milks: ['Vache', 'Avoine', 'Amande'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {},
    link: 'https://www.instagram.com/cafenuances/'
  },
  {
    id: 7,
    name: 'Bønne',
    address: 'Adresse à compléter',
    arrondissement: '',
    type: 'Coffee Shop',
    price: '€€',
    rating: 8.9,
    reviews: 60,
    tags: ['Café', 'Ambiance', 'Spécialités'],
    quote: 'Un coffee shop scandinave, ambiance chaleureuse et douceurs nordiques.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photos: [
      '/images/bonne-photo1.jpg', // Correspond à https://www.instagram.com/p/DTcqFEuDSj1/
      '/images/bonne-photo2.jpg'  // Correspond à https://www.instagram.com/p/DUKuRGFiINF/
    ],
    lat: 48.8667,
    lng: 2.3631,
    menu: [
      { name: 'Café filtre', price: '4€' },
      { name: 'Cinnamon roll', price: '3.5€' },
      { name: 'Iced Coffee', price: '5€' },
    ],
    hours: 'Lun-Dim : 09h-18h',
    reviewsList: [
      { user: 'Anna', note: 10, text: 'Ambiance nordique, café délicieux !' },
      { user: 'Jonas', note: 9, text: 'Super accueil, pâtisseries maison.' },
    ],
    promo: '',
    bases: ['Café filtre', 'Café glacé'],
    milks: ['Vache', 'Avoine', 'Amande'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {},
    link: 'https://www.instagram.com/bonneparis/'
  },
  {
    id: 8,
    name: 'Fika',
    address: 'Adresse à compléter',
    arrondissement: '',
    type: 'Coffee Shop',
    price: '€€',
    rating: 9.2,
    reviews: 70,
    tags: ['Café', 'Ambiance', 'Scandinave'],
    quote: 'Un coin suédois à Paris, parfait pour une pause gourmande et cosy.',
    slots: ['09:00', '09:30', '10:00', '10:30'],
    photos: [
      '/images/fika-photo1.jpg', // https://www.instagram.com/p/CuHfGrpNob4/
      '/images/fika-photo2.jpg', // https://www.instagram.com/p/CuoqMVkr4pk/
      '/images/fika-photo3.jpg', // https://www.instagram.com/p/DJml-WOI1o1/
      '/images/fika-photo4.jpg', // https://www.instagram.com/p/DOGyesOCEup/
      '/images/fika-photo5.jpg'  // https://www.instagram.com/p/DOtse2sCBJx/
    ],
    lat: 48.8667,
    lng: 2.3631,
    menu: [
      { name: 'Kanelbullar', price: '3€' },
      { name: 'Café filtre', price: '4€' },
      { name: 'Iced Coffee', price: '5€' },
    ],
    hours: 'Lun-Dim : 09h-18h',
    reviewsList: [
      { user: 'Sven', note: 10, text: 'Un vrai fika suédois, ambiance chaleureuse !' },
      { user: 'Emma', note: 9, text: 'Pâtisseries délicieuses, staff accueillant.' },
    ],
    promo: '',
    bases: ['Café filtre', 'Café glacé'],
    milks: ['Vache', 'Avoine', 'Amande'],
    sugars: ['0%', '30%', '50%', '100%'],
    toppingsCategories: {},
    link: 'https://www.instagram.com/fikaparis/'
  }
];
// Composant principal Home
export default function Home() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [page, setPage] = useState(1);
  const barsPerPage = 5;
  const totalPages = Math.ceil(bars.length / barsPerPage);
  const paginatedBars = bars.slice((page - 1) * barsPerPage, page * barsPerPage);

  return (
    <>
      <main>
        <h1>Liste des bars</h1>
        <div style={{ display: 'flex', gap: 32 }}>
          <section style={{ flex: 2 }}>
            {paginatedBars.map(bar => (
              <NavBar key={bar.id} bar={bar} />
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
    </>
  );
}