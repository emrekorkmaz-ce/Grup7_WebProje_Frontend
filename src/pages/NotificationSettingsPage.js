import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'react-toastify';
import './NotificationSettingsPage.css';

const NotificationSettingsPage = () => {
  const { t } = useTranslation();
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
      setError(t('notificationSettings.loadError'));
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
      toast.success(t('notificationSettings.saveSuccess'));
    } catch (err) {
      toast.error(t('notificationSettings.saveError'));
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { key: 'academic', label: t('notificationSettings.academic') },
    { key: 'attendance', label: t('notificationSettings.attendance') },
    { key: 'meal', label: t('notificationSettings.meal') },
    { key: 'event', label: t('notificationSettings.event') },
    { key: 'payment', label: t('notificationSettings.payment') },
    { key: 'system', label: t('notificationSettings.system') }
  ];

  const channels = [
    { key: 'email', label: t('notificationSettings.email') },
    { key: 'push', label: t('notificationSettings.push') },
    { key: 'sms', label: t('notificationSettings.sms') }
  ];

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="notification-settings-page">
            <div className="loading">{t('notificationSettings.loading')}</div>
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
            <div className="error-message">{error || t('notificationSettings.dataLoadError')}</div>
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
            <h1>{t('notificationSettings.title')}</h1>
            <p>{t('notificationSettings.subtitle')}</p>
          </div>

          <div className="settings-card">
            <table className="preferences-table">
              <thead>
                <tr>
                  <th>{t('notificationSettings.category')}</th>
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
                {saving ? t('notificationSettings.saving') : t('notificationSettings.save')}
              </button>
            </div>
          </div>

          <div className="info-card">
            <h3>{t('notificationSettings.channelsInfo')}</h3>
            <ul>
              <li><strong>{t('notificationSettings.email')}:</strong> {t('notificationSettings.emailInfo')}</li>
              <li><strong>{t('notificationSettings.push')}:</strong> {t('notificationSettings.pushInfo')}</li>
              <li><strong>{t('notificationSettings.sms')}:</strong> {t('notificationSettings.smsInfo')}</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;

