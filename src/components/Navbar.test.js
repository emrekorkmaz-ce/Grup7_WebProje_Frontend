import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';

// Mock useAuth
const mockLogout = jest.fn().mockResolvedValue();
const mockUser = {
  full_name: 'Test User',
  email: 'test@example.com',
  role: 'student'
};

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout
  })
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders navbar with user name', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Kampüs Yönetim Sistemi/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });

  test('calls logout and navigates to login on logout button click', async () => {
    renderWithRouter(<Navbar />);
    const logoutButton = screen.getByText(/Çıkış Yap/i);
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
