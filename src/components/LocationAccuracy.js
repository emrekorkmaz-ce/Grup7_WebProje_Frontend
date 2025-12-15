import React from 'react';

export function LocationAccuracy({ accuracy }) {
  if (accuracy == null) return null;
  let color = 'gray';
  if (accuracy < 10) color = 'green';
  else if (accuracy < 50) color = 'orange';
  else color = 'red';
  return (
    <div className="location-accuracy" style={{ color }}>
      Konum doğruluğu: {accuracy} m
    </div>
  );
}
