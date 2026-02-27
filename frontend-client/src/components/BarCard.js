import React from 'react';

export default function BarCard({ bar }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 12, marginBottom: 24, padding: 16, background: '#fff' }}>
      <h2 style={{ margin: 0 }}>{bar.name}</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '12px 0' }}>
        {bar.photos && bar.photos.map((src, i) => (
          <img key={i} src={src} alt={bar.name + ' photo ' + (i+1)} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
        ))}
        {bar.videos && bar.videos.map((src, i) => (
          <video key={i} src={src} controls style={{ width: 120, height: 90, borderRadius: 8 }} />
        ))}
      </div>
      <div style={{ fontSize: 14, color: '#555' }}>{bar.address}</div>
      <div style={{ fontSize: 13, color: '#888', margin: '4px 0' }}>{bar.quote}</div>
      <div style={{ fontSize: 13, color: '#888' }}>Note : {bar.rating} ({bar.reviews} avis)</div>
    </div>
  );
}
