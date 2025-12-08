import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFound Page', () => {
  test('renders 404 message', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Sayfa Bulunamadı')).toBeInTheDocument();
  });

  test('renders link to dashboard', () => {
    renderWithRouter(<NotFound />);
    const link = screen.getByText('Panele Dön');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
  });
});
