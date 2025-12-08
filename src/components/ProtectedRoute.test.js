import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Mock useAuth
const mockUseAuth = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  test('renders loading when loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, user: null });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
  });

  test('redirects to login when no user', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: null });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    // Since we can't easily check URL in unit test without history mock, 
    // we check that content is NOT rendered.
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: { role: 'student' } });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to dashboard when role is not allowed', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: { role: 'student' } });
    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders children when role is allowed', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: { role: 'admin' } });
    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
