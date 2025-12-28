import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './MealMenuPage.css';

const MealMenuPage = () => {
  const { t, language } = useTranslation();
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservingMenu, setReservingMenu] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, [selectedDate]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meals/menus?date=${selectedDate}`);
      setMenus(response.data.data || []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || t('meals.loadError');
      setError(errorMessage);
      console.error('Error fetching menus:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (menu) => {
    setReservingMenu(menu);
  };

  const handleConfirmReservation = async () => {
    try {
      const response = await api.post('/meals/reservations', {
        menu_id: reservingMenu.id,
        cafeteria_id: reservingMenu.cafeteriaId || reservingMenu.cafeteria?.id,
        meal_type: reservingMenu.mealType || reservingMenu.meal_type,
        date: selectedDate,
        amount: 0 // Will be calculated by backend
      });

      alert(t('meals.reservationSuccess'));
      setReservingMenu(null);
      fetchMenus();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || t('meals.reservationFailed');
      alert(typeof errorMessage === 'string' ? errorMessage : t('meals.reservationFailed'));
      console.error('Reservation error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: t('meals.breakfast'),
      lunch: t('meals.lunch'),
      dinner: t('meals.dinner')
    };
    return labels[type] || type;
  };

  const lunchMenus = menus.filter(m => (m.mealType || m.meal_type) === 'lunch');
  const dinnerMenus = menus.filter(m => (m.mealType || m.meal_type) === 'dinner');
  const breakfastMenus = menus.filter(m => (m.mealType || m.meal_type) === 'breakfast');

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="meal-menu-page">
          <h1>{t('meals.title')}</h1>

      <div className="date-selector">
        <label>{t('meals.selectDate')}</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <div className="menus-container">
          {breakfastMenus.length > 0 && (
            <div className="meal-section">
              <h2>{t('meals.breakfast')}</h2>
              {breakfastMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} t={t} language={language} />
              ))}
            </div>
          )}

          {lunchMenus.length > 0 && (
            <div className="meal-section">
              <h2>{t('meals.lunch')}</h2>
              {lunchMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} t={t} language={language} />
              ))}
            </div>
          )}

          {dinnerMenus.length > 0 && (
            <div className="meal-section">
              <h2>{t('meals.dinner')}</h2>
              {dinnerMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} t={t} language={language} />
              ))}
            </div>
          )}

          {menus.length === 0 && (
            <div className="no-menus">{t('common.noData')}</div>
          )}
        </div>
      )}

      {reservingMenu && (
        <ReservationModal
          menu={reservingMenu}
          date={selectedDate}
          onConfirm={handleConfirmReservation}
          onClose={() => setReservingMenu(null)}
          t={t}
          language={language}
        />
      )}
        </div>
      </main>
    </div>
  );
};

const MealCard = ({ menu, onReserve, t, language }) => {
  const items = menu.itemsJson || menu.items_json || {};
  const nutrition = menu.nutritionJson || menu.nutrition_json || {};

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h3>{menu.cafeteria?.name || t('meals.cafeteria')}</h3>
        <span className="location">{menu.cafeteria?.location}</span>
      </div>
      <div className="meal-content">
        <div className="meal-items">
          <div className="meal-item">
            <strong>{t('meals.mainCourse')}:</strong> {items.main || 'N/A'}
          </div>
          <div className="meal-item">
            <strong>{t('meals.sideDish')}:</strong> {items.side || 'N/A'}
          </div>
          <div className="meal-item">
            <strong>{t('meals.dessert')}:</strong> {items.dessert || 'N/A'}
          </div>
          {(items.vegan || items.vegetarian) && (
            <div className="meal-badges">
              {items.vegan && <span className="badge vegan">{t('meals.vegan')}</span>}
              {items.vegetarian && <span className="badge vegetarian">{t('meals.vegetarian')}</span>}
            </div>
          )}
        </div>
        {nutrition.calories && (
          <div className="nutrition-info">
            <div>{t('meals.calories')}: {nutrition.calories} kcal</div>
            <div>{t('meals.protein')}: {nutrition.protein}g</div>
            <div>{t('meals.carbs')}: {nutrition.carbs}g</div>
            <div>{t('meals.fat')}: {nutrition.fat}g</div>
          </div>
        )}
      </div>
      <button className="reserve-btn" onClick={() => onReserve(menu)}>
        {t('meals.reserve')}
      </button>
    </div>
  );
};

const ReservationModal = ({ menu, date, onConfirm, onClose, t, language }) => {
  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: t('meals.breakfast'),
      lunch: t('meals.lunch'),
      dinner: t('meals.dinner')
    };
    return labels[type] || type;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('meals.reservationConfirmation')}</h2>
        <div className="reservation-details">
          <p><strong>{t('attendance.date')}:</strong> {new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}</p>
          <p><strong>{t('meals.meal')}:</strong> {getMealTypeLabel(menu.mealType || menu.meal_type)}</p>
          <p><strong>{t('meals.cafeteria')}:</strong> {menu.cafeteria?.name}</p>
          <p><strong>{t('meals.mainCourse')}:</strong> {(menu.itemsJson || menu.items_json)?.main}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onConfirm} className="confirm-btn">{t('common.confirm')}</button>
          <button onClick={onClose} className="cancel-btn">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default MealMenuPage;


