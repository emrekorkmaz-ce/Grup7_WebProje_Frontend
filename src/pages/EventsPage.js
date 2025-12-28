import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './EventsPage.css';

const EventsPage = () => {
  const { t, language } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { status: 'published' };
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      const response = await api.get('/events', { params });
      setEvents(response.data.data || []);
      setError('');
    } catch (err) {
      setError(t('events.loadError'));
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'all', label: t('events.all') },
    { value: 'conference', label: t('events.conference') },
    { value: 'workshop', label: t('events.workshop') },
    { value: 'social', label: t('events.social') },
    { value: 'sports', label: t('events.sports') },
    { value: 'academic', label: t('events.academic') },
    { value: 'cultural', label: t('events.cultural') }
  ];

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="events-page">
          <h1>{t('events.title')}</h1>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('events.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={categoryFilter === cat.value ? 'active' : ''}
              onClick={() => setCategoryFilter(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <div className="events-grid">
          {filteredEvents.length === 0 ? (
            <div className="no-events">{t('events.noEvents')}</div>
          ) : (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
                t={t}
                language={language}
              />
            ))
          )}
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

const EventCard = ({ event, onClick, t, language }) => {
  const getCategoryLabel = (category) => {
    return t(`events.categoryLabels.${category}`) || category;
  };

  const getCategoryClass = (category) => {
    return `category-badge category-${category}`;
  };

  const isUpcoming = new Date(event.date) >= new Date();
  const remainingSpots = event.capacity - event.registeredCount;

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-header">
        <span className={getCategoryClass(event.category)}>
          {getCategoryLabel(event.category)}
        </span>
        {event.isPaid && (
          <span className="paid-badge">{t('events.paid')}</span>
        )}
      </div>
      <h3>{event.title}</h3>
      <div className="event-date">
        <strong>{t('events.date')}:</strong>{' '}
        {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
      <div className="event-time">
        <strong>{t('events.time')}:</strong> {event.startTime} - {event.endTime}
      </div>
      <div className="event-location">
        <strong>{t('events.location')}:</strong> {event.location}
      </div>
      <div className="event-capacity">
        <strong>{t('events.capacity')}:</strong> {remainingSpots} / {event.capacity} {t('events.remaining')}
      </div>
      {event.isPaid && event.price && (
        <div className="event-price">
          <strong>{t('events.price')}:</strong> {event.price} TRY
        </div>
      )}
      {event.description && (
        <p className="event-description">
          {event.description.length > 100
            ? `${event.description.substring(0, 100)}...`
            : event.description}
        </p>
      )}
      <div className="event-footer">
        {isUpcoming ? (
          <span className="status-upcoming">{t('events.upcoming')}</span>
        ) : (
          <span className="status-past">{t('events.past')}</span>
        )}
        {remainingSpots <= 0 && (
          <span className="status-full">{t('events.full')}</span>
        )}
      </div>
    </div>
  );
};

export default EventsPage;


