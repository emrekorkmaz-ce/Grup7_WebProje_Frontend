import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading Component', () => {
  test('renders loading spinner and text', () => {
    render(<Loading />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });
});
