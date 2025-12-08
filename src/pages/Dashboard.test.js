import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import api from '../services/api';
import { AuthProvider } from '../context/AuthContext';

// Mock API
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock useAuth
const mockUser = {
  full_name: 'Test User',
  role: 'student'
};

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    logout: jest.fn()
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeAll(() => {
    // Mock window.alert
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with user name', async () => {
    renderWithRouter(<Dashboard />);
    
    // Use a more flexible matcher for the heading
    expect(screen.getByRole('heading', { name: /Tekrar hoşgeldiniz/i })).toBeInTheDocument();
    const userNameElements = screen.getAllByText(/Test User/i);
    expect(userNameElements.length).toBeGreaterThan(0);
  });

  test('displays current date', async () => {
    renderWithRouter(<Dashboard />);
    const dateElement = screen.getByText(new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    expect(dateElement).toBeInTheDocument();
  });

  test('handles quick actions', async () => {
    renderWithRouter(<Dashboard />);
    
    const scheduleBtn = screen.getByText(/Ders Programı/i);
    fireEvent.click(scheduleBtn);
    expect(window.alert).toHaveBeenCalledWith('Bu özellik yapım aşamasındadır.');
    
    const coursesBtn = screen.getByText(/Derslerim/i);
    fireEvent.click(coursesBtn);
    expect(window.alert).toHaveBeenCalledWith('Bu özellik yapım aşamasındadır.');

    const gradesBtn = screen.getByText(/Notlar/i);
    fireEvent.click(gradesBtn);
    expect(window.alert).toHaveBeenCalledWith('Bu özellik yapım aşamasındadır.');

    // Clear mocks to ensure previous alerts don't interfere
    window.alert.mockClear();

    const settingsBtn = screen.getByText(/Ayarlar/i);
    fireEvent.click(settingsBtn);
    // Should navigate, not alert
    expect(window.alert).not.toHaveBeenCalled();
  });
});
