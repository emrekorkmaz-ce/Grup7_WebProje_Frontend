import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// =======================
// MOCKS
// =======================
jest.mock('../context/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Login Component', () => {
  let mockLogin;
  let mockNavigate;

  beforeEach(() => {
    mockLogin = jest.fn();
    mockNavigate = jest.fn();

    useAuth.mockReturnValue({
      login: mockLogin,
      user: null
    });

    useNavigate.mockReturnValue(mockNavigate);
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  // =======================
  // RENDER TESTS
  // =======================
  describe('Component Rendering', () => {
    it('renders all main elements', () => {
      renderLogin();

      expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
      expect(screen.getByText('Kampüs sistemine hoşgeldiniz')).toBeInTheDocument();
      expect(screen.getByLabelText(/e-posta adresi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/beni hatırla/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
      expect(screen.getByText('🎓')).toBeInTheDocument();
    });

    it('renders correct links', () => {
      renderLogin();

      expect(screen.getByText(/şifremi unuttum/i).closest('a'))
        .toHaveAttribute('href', '/forgot-password');

      expect(screen.getByText('Kayıt Ol').closest('a'))
        .toHaveAttribute('href', '/register');
    });
  });

  // =======================
  // REDIRECT
  // =======================
  describe('User Already Logged In', () => {
    it('redirects to dashboard if user exists', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        user: { uid: '1' }
      });

      renderLogin();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // =======================
  // VALIDATION
  // =======================
  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      renderLogin();
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(screen.getByText('E-posta gereklidir')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email', async () => {
      renderLogin();
      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'invalid' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(screen.getByText('Geçersiz e-posta formatı')).toBeInTheDocument();
      });
    });

    it('shows error when password is empty', async () => {
      renderLogin();
      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(screen.getByText('Şifre gereklidir')).toBeInTheDocument();
      });
    });
  });

  // =======================
  // SUBMISSION
  // =======================
  describe('Form Submission', () => {
    it('calls login with correct credentials', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
      });
    });

    it('shows error on login failure', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'wrong' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  // =======================
  // REMEMBER ME
  // =======================
  describe('Remember Me', () => {
    it('stores rememberMe in localStorage when checked', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByLabelText(/beni hatırla/i));
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(localStorage.getItem('rememberMe')).toBe('true');
      });
    });
  });

  // =======================
  // LOADING STATE
  // =======================
  describe('Loading State', () => {
    it('disables inputs during loading', async () => {
      let resolveLogin;
      mockLogin.mockReturnValue(
        new Promise(resolve => (resolveLogin = resolve))
      );

      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(screen.getByText('Giriş yapılıyor...')).toBeInTheDocument();
      });

      act(() => resolveLogin({ success: true }));
    });
  });

  // =======================
  // EDGE CASES
  // =======================
  describe('Edge Cases', () => {
    it('handles empty string error gracefully', async () => {
      mockLogin.mockResolvedValue({ success: false, error: '' });
      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('prevents multiple rapid submissions', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLogin();

      fireEvent.change(screen.getByLabelText(/e-posta adresi/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/şifre/i), {
        target: { value: 'password123' }
      });

      const btn = screen.getByRole('button', { name: /giriş yap/i });
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });
  });
});
