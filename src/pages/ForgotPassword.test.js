import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import api from '../services/api';
import { act } from 'react';

jest.mock('../services/api');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders forgot password form', () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getByRole('heading', { name: /Şifremi Unuttum/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sıfırlama Bağlantısı Gönder/i })).toBeInTheDocument();
  });

  test('handles successful submission', async () => {
    api.post.mockResolvedValue({});

    renderWithRouter(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/E-posta/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Sıfırlama Bağlantısı Gönder/i });
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
      expect(screen.getByText(/şifre sıfırlama bağlantısı gönderildi/i)).toBeInTheDocument();
    });
  });

  test('handles submission error', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'User not found'
        }
      }
    });

    renderWithRouter(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/E-posta/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Sıfırlama Bağlantısı Gönder/i });
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
