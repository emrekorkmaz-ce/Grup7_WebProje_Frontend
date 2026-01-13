import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const EventCheckInPage = () => {
  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <h2>Etkinlik Check-in</h2>
          <p>Etkinlik check-in sayfası - Geliştirilme aşamasında</p>
        </div>
      </main>
    </div>
  );
};

export default EventCheckInPage;


