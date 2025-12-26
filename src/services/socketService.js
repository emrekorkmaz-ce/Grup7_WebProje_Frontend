import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    this.socket = io(backendUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Notification listener
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    // Attendance update listener
    this.socket.on('attendance-update', (update) => {
      this.emit('attendance-update', update);
    });

    // Sensor data listener
    this.socket.on('sensor-data', (data) => {
      this.emit('sensor-data', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  subscribeAttendance(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-attendance', sessionId);
    }
  }

  unsubscribeAttendance(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-attendance', sessionId);
    }
  }

  subscribeSensor(sensorId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-sensor', sensorId);
    }
  }

  unsubscribeSensor(sensorId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-sensor', sensorId);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;

