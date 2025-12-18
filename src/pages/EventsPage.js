import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EventsPage.css';

const EventsPage = () => {
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
      setError('Etkinlikler yüklenemedi. Lütfen tekrar deneyin.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'conference', label: 'Konferans' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Sosyal' },
    { value: 'sports', label: 'Spor' },
    { value: 'academic', label: 'Akademik' },
    { value: 'cultural', label: 'Kültürel' }
  ];

  return (
    <div className="events-page">
      <h1>Etkinlikler</h1>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Etkinlik ara..."
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
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="events-grid">
          {filteredEvents.length === 0 ? (
            <div className="no-events">Etkinlik bulunmamaktadır.</div>
          ) : (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onClick }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      conference: 'Konferans',
      workshop: 'Workshop',
      social: 'Sosyal',
      sports: 'Spor',
      academic: 'Akademik',
      cultural: 'Kültürel'
    };
    return labels[category] || category;
  };

  const getCategoryClass = (category) => {
    return `category-badge category-${category}`;
  };

  const isUpcoming = new Date(event.date) >= new Date();
  const remainingSpots = event.capacity - event.registered_count;

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-header">
        <span className={getCategoryClass(event.category)}>
          {getCategoryLabel(event.category)}
        </span>
        {event.is_paid && (
          <span className="paid-badge">Ücretli</span>
        )}
      </div>
      <h3>{event.title}</h3>
      <div className="event-date">
        <strong>Tarih:</strong>{' '}
        {new Date(event.date).toLocaleDateString('tr-TR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
      <div className="event-time">
        <strong>Saat:</strong> {event.start_time} - {event.end_time}
      </div>
      <div className="event-location">
        <strong>Konum:</strong> {event.location}
      </div>
      <div className="event-capacity">
        <strong>Kapasite:</strong> {remainingSpots} / {event.capacity} kalan
      </div>
      {event.is_paid && event.price && (
        <div className="event-price">
          <strong>Ücret:</strong> {event.price} TRY
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
          <span className="status-upcoming">Yaklaşan</span>
        ) : (
          <span className="status-past">Geçmiş</span>
        )}
        {remainingSpots <= 0 && (
          <span className="status-full">Dolu</span>
        )}
      </div>
    </div>
  );
};

export default EventsPage;


