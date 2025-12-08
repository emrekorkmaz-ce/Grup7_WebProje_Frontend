import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import api from '../services/api';
import { act } from 'react';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'test-token' })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ResetPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reset password form', () => {
    renderWithRouter(<ResetPassword />);
    expect(screen.getByRole('heading', { name: /Şifreyi Sıfırla/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Yeni Şifre')).toBeInTheDocument();
    expect(screen.getByLabelText('Şifreyi Onayla')).toBeInTheDocument();
  });

  test('validates password requirements', async () => {
    renderWithRouter(<ResetPassword />);
    
    const submitButton = screen.getByRole('button', { name: /Şifreyi Sıfırla/i });
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Check for any of the validation errors that might appear
      const errorMessage = screen.queryByText(/Şifre gereklidir/i) || 
                          screen.queryByText(/Şifre en az 8 karakter olmalıdır/i) ||
                          screen.queryByText(/Lütfen şifrenizi onaylayın/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('handles successful password reset', async () => {
    api.post.mockResolvedValue({});

    renderWithRouter(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText('Yeni Şifre');
    const confirmPasswordInput = screen.getByLabelText('Şifreyi Onayla');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Şifreyi Sıfırla/i });
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { password: 'Password123' });
      expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
    });
  });

  test('handles reset error', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid token'
        }
      }
    });

    renderWithRouter(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText('Yeni Şifre');
    const confirmPasswordInput = screen.getByLabelText('Şifreyi Onayla');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Şifreyi Sıfırla/i });
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });
  });
});
