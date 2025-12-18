import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/users');
        // Backend returns { success: true, data: { users: [...], pagination: {...} } }
        let usersData = [];
        if (response.data?.data?.users) {
          usersData = response.data.data.users;
        } else if (response.data?.users) {
          usersData = response.data.users;
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } else {
          console.error('Unexpected API response format:', response.data);
          usersData = [];
        }
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Kullanıcı listesi alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Kullanıcı Yönetimi
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sistemdeki tüm kayıtlı kullanıcıları buradan yönetebilirsiniz.</p>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Kayıtlar yükleniyor...</div>
          ) : error ? (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px' }}>{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ad Soyad</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>E-posta</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rol</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Durum</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{formatName(user.full_name)}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'faculty' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: user.role === 'admin' ? '#ef4444' : user.role === 'faculty' ? '#3b82f6' : '#10b981',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem'
                        }}>
                          {user.role === 'admin' ? 'Yönetici' :
                            user.role === 'faculty' ? 'Akademisyen' : 'Öğrenci'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: user.is_verified ? '#10b981' : '#f59e0b',
                            boxShadow: user.is_verified ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                          }} />
                          <span style={{ color: user.is_verified ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>
                            {user.is_verified ? 'Doğrulanmış' : 'Bekliyor'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;