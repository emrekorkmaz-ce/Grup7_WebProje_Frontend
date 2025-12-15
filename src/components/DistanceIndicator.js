import React from 'react';

export function DistanceIndicator({ userLocation, targetLocation }) {
  if (!userLocation || !targetLocation) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(targetLocation.lat - userLocation.lat);
  const dLon = toRad(targetLocation.lng - userLocation.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(targetLocation.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return (
    <div className="distance-indicator">
      Konuma uzaklık: <b>{distance.toFixed(1)} m</b>
    </div>
  );
}
