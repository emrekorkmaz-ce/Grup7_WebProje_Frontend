import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read' && !notification.isRead) return false;
    if (filter === 'unread' && notification.isRead) return false;
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    return true;
  });

  const categories = ['all', 'academic', 'attendance', 'meal', 'event', 'payment', 'system'];

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="notifications-page">
          <div className="notifications-header">
            <h1>Bildirimler</h1>
            <button className="btn btn-primary" onClick={markAllAsRead}>
              Tümünü Okundu İşaretle
            </button>
          </div>

          <div className="notifications-filters">
            <div className="filter-group">
              <label>Durum:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Tümü</option>
                <option value="unread">Okunmamış</option>
                <option value="read">Okunmuş</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Kategori:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">Bildirim bulunmamaktadır.</div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-card-content">
                    <div className="notification-card-header">
                      <h3>{notification.title}</h3>
                      <span className="notification-category">{notification.category}</span>
                    </div>
                    <p className="notification-card-message">{notification.message}</p>
                    <div className="notification-card-footer">
                      <span className="notification-card-time">
                        {new Date(notification.createdAt).toLocaleString('tr-TR')}
                      </span>
                      <div className="notification-card-actions">
                        {!notification.isRead && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Okundu İşaretle
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;

