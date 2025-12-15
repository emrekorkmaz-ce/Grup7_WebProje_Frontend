import React from 'react';

export function MapPreview({ lat, lng }) {
  if (!lat || !lng) return null;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.001}%2C${lat-0.001}%2C${lng+0.001}%2C${lat+0.001}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="map-preview" style={{ width: '100%', height: 300 }}>
      <iframe
        title="Konum Haritası"
        width="100%"
        height="300"
        frameBorder="0"
        src={mapUrl}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );
}
