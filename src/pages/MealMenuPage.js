import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './MealMenuPage.css';

const MealMenuPage = () => {
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
      setError('Menüler yüklenemedi. Lütfen tekrar deneyin.');
      console.error('Error fetching menus:', err);
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

      alert('Rezervasyon başarıyla oluşturuldu!');
      setReservingMenu(null);
      fetchMenus();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Rezervasyon oluşturulamadı.';
      alert(typeof errorMessage === 'string' ? errorMessage : 'Rezervasyon oluşturulamadı.');
      console.error('Reservation error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği'
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
          <h1>Yemek Menüsü</h1>

      <div className="date-selector">
        <label>Tarih Seçin:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="menus-container">
          {breakfastMenus.length > 0 && (
            <div className="meal-section">
              <h2>Kahvaltı</h2>
              {breakfastMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} />
              ))}
            </div>
          )}

          {lunchMenus.length > 0 && (
            <div className="meal-section">
              <h2>Öğle Yemeği</h2>
              {lunchMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} />
              ))}
            </div>
          )}

          {dinnerMenus.length > 0 && (
            <div className="meal-section">
              <h2>Akşam Yemeği</h2>
              {dinnerMenus.map(menu => (
                <MealCard key={menu.id} menu={menu} onReserve={handleReserve} />
              ))}
            </div>
          )}

          {menus.length === 0 && (
            <div className="no-menus">Bu tarih için menü bulunmamaktadır.</div>
          )}
        </div>
      )}

      {reservingMenu && (
        <ReservationModal
          menu={reservingMenu}
          date={selectedDate}
          onConfirm={handleConfirmReservation}
          onClose={() => setReservingMenu(null)}
        />
      )}
        </div>
      </main>
    </div>
  );
};

const MealCard = ({ menu, onReserve }) => {
  const items = menu.itemsJson || menu.items_json || {};
  const nutrition = menu.nutritionJson || menu.nutrition_json || {};

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h3>{menu.cafeteria?.name || 'Kafeterya'}</h3>
        <span className="location">{menu.cafeteria?.location}</span>
      </div>
      <div className="meal-content">
        <div className="meal-items">
          <div className="meal-item">
            <strong>Ana Yemek:</strong> {items.main || 'N/A'}
          </div>
          <div className="meal-item">
            <strong>Yan Yemek:</strong> {items.side || 'N/A'}
          </div>
          <div className="meal-item">
            <strong>Tatlı:</strong> {items.dessert || 'N/A'}
          </div>
          {(items.vegan || items.vegetarian) && (
            <div className="meal-badges">
              {items.vegan && <span className="badge vegan">Vegan</span>}
              {items.vegetarian && <span className="badge vegetarian">Vejetaryen</span>}
            </div>
          )}
        </div>
        {nutrition.calories && (
          <div className="nutrition-info">
            <div>Kalori: {nutrition.calories} kcal</div>
            <div>Protein: {nutrition.protein}g</div>
            <div>Karbonhidrat: {nutrition.carbs}g</div>
            <div>Yağ: {nutrition.fat}g</div>
          </div>
        )}
      </div>
      <button className="reserve-btn" onClick={() => onReserve(menu)}>
        Rezerve Et
      </button>
    </div>
  );
};

const ReservationModal = ({ menu, date, onConfirm, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Rezervasyon Onayı</h2>
        <div className="reservation-details">
          <p><strong>Tarih:</strong> {new Date(date).toLocaleDateString('tr-TR')}</p>
          <p><strong>Öğün:</strong> {(menu.mealType || menu.meal_type) === 'lunch' ? 'Öğle Yemeği' : (menu.mealType || menu.meal_type) === 'dinner' ? 'Akşam Yemeği' : 'Kahvaltı'}</p>
          <p><strong>Kafeterya:</strong> {menu.cafeteria?.name}</p>
          <p><strong>Ana Yemek:</strong> {(menu.itemsJson || menu.items_json)?.main}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onConfirm} className="confirm-btn">Onayla</button>
          <button onClick={onClose} className="cancel-btn">İptal</button>
        </div>
      </div>
    </div>
  );
};

export default MealMenuPage;


