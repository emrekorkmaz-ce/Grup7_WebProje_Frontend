import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import api from '../services/api';
import { act } from 'react';

// Mock API
jest.mock('../services/api');

// Mock useAuth
const mockUpdateUser = jest.fn();
const mockUser = {
  full_name: 'Test User',
  phone: '5551234567',
  profile_picture_url: 'http://example.com/pic.jpg',
  role: 'student'
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
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

describe('Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile form with user data', () => {
    renderWithRouter(<Profile />);
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument();
  });

  test('updates profile successfully', async () => {
    api.put.mockResolvedValueOnce({
      data: {
        user: { ...mockUser, full_name: 'Updated User' }
      }
    });

    renderWithRouter(<Profile />);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated User' } });
    
    const submitButton = screen.getByText(/Değişiklikleri Kaydet/i);
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/users/me', expect.objectContaining({
        full_name: 'Updated User'
      }));
      expect(screen.getByText(/Profil başarıyla güncellendi/i)).toBeInTheDocument();
    });
  });

  test('handles update error', async () => {
    api.put.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Update failed'
        }
      }
    });

    renderWithRouter(<Profile />);
    
    const submitButton = screen.getByText(/Değişiklikleri Kaydet/i);
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Check for either the specific message or the fallback
      const errorMessage = screen.queryByText(/Update failed/i) || screen.queryByText(/Profil güncellenemedi/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
