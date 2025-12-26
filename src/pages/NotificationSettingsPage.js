import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './NotificationSettingsPage.css';

const NotificationSettingsPage = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.data);
      setError('');
    } catch (err) {
      setError('Bildirim tercihleri yüklenemedi.');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (channel, category) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: !prev[channel][category]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/notifications/preferences', { preferences });
      toast.success('Bildirim tercihleri başarıyla güncellendi.');
    } catch (err) {
      toast.error('Bildirim tercihleri güncellenemedi.');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { key: 'academic', label: 'Akademik' },
    { key: 'attendance', label: 'Yoklama' },
    { key: 'meal', label: 'Yemek' },
    { key: 'event', label: 'Etkinlik' },
    { key: 'payment', label: 'Ödeme' },
    { key: 'system', label: 'Sistem' }
  ];

  const channels = [
    { key: 'email', label: 'E-posta' },
    { key: 'push', label: 'Push Bildirimi' },
    { key: 'sms', label: 'SMS' }
  ];

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="notification-settings-page">
            <div className="loading">Yükleniyor...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !preferences) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="notification-settings-page">
            <div className="error-message">{error || 'Veri yüklenemedi'}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="notification-settings-page">
          <div className="settings-header">
            <h1>Bildirim Ayarları</h1>
            <p>Hangi bildirimleri hangi kanallardan almak istediğinizi seçebilirsiniz.</p>
          </div>

          <div className="settings-card">
            <table className="preferences-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  {channels.map(channel => (
                    <th key={channel.key}>{channel.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.key}>
                    <td className="category-label">{category.label}</td>
                    {channels.map(channel => {
                      // SMS sadece attendance ve payment için
                      if (channel.key === 'sms' && !['attendance', 'payment'].includes(category.key)) {
                        return <td key={channel.key} className="disabled-cell">-</td>;
                      }
                      
                      const isEnabled = preferences[channel.key]?.[category.key] || false;
                      return (
                        <td key={channel.key}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleToggle(channel.key, category.key)}
                            />
                            <span className="slider"></span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="settings-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>

          <div className="info-card">
            <h3>Bildirim Kanalları Hakkında</h3>
            <ul>
              <li><strong>E-posta:</strong> Bildirimler e-posta adresinize gönderilir.</li>
              <li><strong>Push Bildirimi:</strong> Tarayıcınızda anlık bildirimler alırsınız.</li>
              <li><strong>SMS:</strong> Sadece kritik bildirimler (yoklama uyarıları, ödeme bildirimleri) için kullanılır.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;

