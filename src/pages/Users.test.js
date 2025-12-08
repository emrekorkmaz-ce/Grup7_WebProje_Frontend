import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Users from './Users';
import api from '../services/api';

// Mock API
jest.mock('../services/api');

// Mock Navbar and Sidebar to avoid complexity
jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Users Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithRouter(<Users />);
    expect(screen.getByText(/Yükleniyor.../i)).toBeInTheDocument();
  });

  test('renders users list successfully', async () => {
    const mockUsers = [
      {
        id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        is_verified: true,
        created_at: '2023-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'faculty',
        is_verified: false,
        created_at: '2023-02-01T00:00:00.000Z'
      }
    ];

    api.get.mockResolvedValue({ data: { users: mockUsers } });

    renderWithRouter(<Users />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Öğrenci')).toBeInTheDocument();
      expect(screen.getByText('Akademisyen')).toBeInTheDocument();
      expect(screen.getByText('Doğrulanmış')).toBeInTheDocument();
      expect(screen.getByText('Bekliyor')).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    api.get.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/Kullanıcı listesi alınırken bir hata oluştu/i)).toBeInTheDocument();
    });
  });
  
  test('handles empty user list', async () => {
      api.get.mockResolvedValue({ data: { users: [] } });
      renderWithRouter(<Users />);
      
      await waitFor(() => {
          expect(screen.queryByText('Yükleniyor...')).not.toBeInTheDocument();
          // Check if table headers are present but no rows
          expect(screen.getByText('Ad Soyad')).toBeInTheDocument();
      });
  });
});
