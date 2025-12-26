import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import socketService from '../services/socketService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './IoTDashboardPage.css';

const IoTDashboardPage = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d
  const [aggregation, setAggregation] = useState('avg'); // avg, min, max

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      fetchSensorData();
      subscribeToSensor();
    }

    return () => {
      if (selectedSensor) {
        socketService.unsubscribeSensor(selectedSensor.id);
      }
    };
  }, [selectedSensor, timeRange, aggregation]);

  useEffect(() => {
    const handleSensorData = (data) => {
      if (data.sensorId === selectedSensor?.sensorId) {
        setSensorData(prev => [data, ...prev.slice(0, 99)]);
      }
    };

    socketService.on('sensor-data', handleSensorData);

    return () => {
      socketService.off('sensor-data', handleSensorData);
    };
  }, [selectedSensor]);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sensors');
      setSensors(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedSensor(response.data.data[0]);
      }
      setError('');
    } catch (err) {
      setError('Sensörler yüklenemedi.');
      console.error('Error fetching sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorData = async () => {
    if (!selectedSensor) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const interval = timeRange === '24h' ? 'hour' : 'day';
      
      const response = await api.get(`/sensors/${selectedSensor.id}/data`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          aggregation,
          interval
        }
      });

      setSensorData(response.data.data?.data || []);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    }
  };

  const subscribeToSensor = () => {
    if (selectedSensor && socketService.isConnected()) {
      socketService.subscribeSensor(selectedSensor.id);
    }
  };

  const handleCreateSensor = async () => {
    const sensorId = prompt('Sensor ID:');
    const name = prompt('Sensor Adı:');
    const type = prompt('Sensor Tipi (temperature, occupancy, energy):');
    const unit = prompt('Birim:');

    if (!sensorId || !name || !type || !unit) {
      alert('Tüm alanlar doldurulmalıdır.');
      return;
    }

    try {
      const response = await api.post('/sensors', {
        sensorId,
        name,
        type,
        unit
      });
      setSensors(prev => [...prev, response.data.data]);
      alert('Sensör başarıyla oluşturuldu.');
    } catch (err) {
      alert('Sensör oluşturulamadı.');
      console.error('Error creating sensor:', err);
    }
  };

  const handleAddData = async () => {
    if (!selectedSensor) return;

    const value = prompt('Değer:');
    if (!value || isNaN(value)) {
      alert('Geçerli bir değer giriniz.');
      return;
    }

    try {
      await api.post(`/sensors/${selectedSensor.id}/data`, {
        value: parseFloat(value)
      });
      alert('Veri başarıyla eklendi.');
      fetchSensorData();
    } catch (err) {
      alert('Veri eklenemedi.');
      console.error('Error adding sensor data:', err);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="iot-dashboard-page">
            <div className="loading">Yükleniyor...</div>
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
        <div className="iot-dashboard-page">
          <div className="dashboard-header">
            <h1>IoT Sensör Dashboard</h1>
            <button className="btn btn-primary" onClick={handleCreateSensor}>
              Yeni Sensör Ekle
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="dashboard-content">
            {/* Sensor List */}
            <div className="sensors-panel">
              <h2>Sensörler</h2>
              <div className="sensors-list">
                {sensors.map(sensor => (
                  <div
                    key={sensor.id}
                    className={`sensor-item ${selectedSensor?.id === sensor.id ? 'active' : ''}`}
                    onClick={() => setSelectedSensor(sensor)}
                  >
                    <div className="sensor-info">
                      <h3>{sensor.name}</h3>
                      <p className="sensor-type">{sensor.type}</p>
                      <p className="sensor-location">{sensor.location || 'Konum belirtilmemiş'}</p>
                    </div>
                    {sensor.latestReading && (
                      <div className="sensor-reading">
                        <div className="reading-value">
                          {sensor.latestReading.value} {sensor.unit}
                        </div>
                        <div className="reading-time">
                          {new Date(sensor.latestReading.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor Data Panel */}
            {selectedSensor && (
              <div className="data-panel">
                <div className="panel-header">
                  <h2>{selectedSensor.name} - Veri Analizi</h2>
                  <div className="panel-controls">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="control-select"
                    >
                      <option value="24h">Son 24 Saat</option>
                      <option value="7d">Son 7 Gün</option>
                      <option value="30d">Son 30 Gün</option>
                    </select>
                    <select
                      value={aggregation}
                      onChange={(e) => setAggregation(e.target.value)}
                      className="control-select"
                    >
                      <option value="avg">Ortalama</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maksimum</option>
                    </select>
                    <button className="btn btn-secondary" onClick={handleAddData}>
                      Veri Ekle
                    </button>
                  </div>
                </div>

                <div className="chart-container">
                  {sensorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          name={`${selectedSensor.name} (${selectedSensor.unit})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data">Veri bulunmamaktadır.</div>
                  )}
                </div>

                <div className="sensor-details">
                  <h3>Sensör Detayları</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Sensor ID:</span>
                      <span className="detail-value">{selectedSensor.sensorId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tip:</span>
                      <span className="detail-value">{selectedSensor.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Birim:</span>
                      <span className="detail-value">{selectedSensor.unit}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Durum:</span>
                      <span className={`detail-value status-${selectedSensor.isActive ? 'active' : 'inactive'}`}>
                        {selectedSensor.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IoTDashboardPage;

