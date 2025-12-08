import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mock useAuth
const mockUser = {
  role: 'student'
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  test('renders basic links for student', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText(/Ana Sayfa/i)).toBeInTheDocument();
    expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    expect(screen.queryByText(/Kullanıcılar/i)).not.toBeInTheDocument();
  });

  test('renders users link for admin', () => {
    // Override mock for this test
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementation(() => ({
        user: { role: 'admin' }
    }));

    renderWithRouter(<Sidebar />);
    expect(screen.getByText(/Kullanıcılar/i)).toBeInTheDocument();
  });
});
