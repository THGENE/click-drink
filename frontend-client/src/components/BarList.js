import React from 'react';

export default function BarList({ bars, hoveredBarId, setHoveredBarId }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {bars.map(bar => (
        <li
          key={bar.id}
          onMouseEnter={() => setHoveredBarId(bar.id)}
          onMouseLeave={() => setHoveredBarId(null)}
          style={{
            background: bar.id === hoveredBarId ? '#e0f7fa' : 'transparent',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            marginBottom: 6,
            fontWeight: bar.id === hoveredBarId ? 'bold' : 'normal',
          }}
        >
          {bar.name}
        </li>
      ))}
    </ul>
  );
}
