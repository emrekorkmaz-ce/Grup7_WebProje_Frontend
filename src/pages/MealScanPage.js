import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MealScanPage = () => {
  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <h2>QR Kod Tarayıcı</h2>
          <p>Yemek rezervasyonu kullanım sayfası - Geliştirilme aşamasında</p>
        </div>
      </main>
    </div>
  );
};

export default MealScanPage;


