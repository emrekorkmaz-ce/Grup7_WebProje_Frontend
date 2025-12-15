import { useState, useEffect } from 'react';

// GPS izni ve konum yönetimi için hook
export function useGPSPermission() {
  const [permission, setPermission] = useState('prompt');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Cihazda konum servisi yok.');
      setPermission('denied');
      return;
    }
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      setPermission(result.state);
      result.onchange = () => setPermission(result.state);
    }).catch(() => setPermission('prompt'));
  }, []);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Cihazda konum servisi yok.');
      setPermission('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setError(null);
      },
      (err) => {
        setError('Konum alınamadı.');
      }
    );
  };

  return { permission, location, error, requestLocation };
}
