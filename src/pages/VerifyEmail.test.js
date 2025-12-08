import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';
import api from '../services/api';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'valid-token' })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('VerifyEmail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders verifying state initially', () => {
    api.post.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithRouter(<VerifyEmail />);
    expect(screen.getByText(/E-postanız doğrulanıyor/i)).toBeInTheDocument();
  });

  test('handles successful verification', async () => {
    api.post.mockResolvedValue({});

    renderWithRouter(<VerifyEmail />);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/verify-email/valid-token');
      expect(screen.getByText(/E-posta Doğrulandı/i)).toBeInTheDocument();
    });
  });

  test('handles verification error', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid token'
        }
      }
    });

    renderWithRouter(<VerifyEmail />);

    await waitFor(() => {
      expect(screen.getByText(/Doğrulama Başarısız/i)).toBeInTheDocument();
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });
  });
});
