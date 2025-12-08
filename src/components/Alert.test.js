import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from './Alert';

describe('Alert Component', () => {
  test('renders message', () => {
    render(<Alert type="success" message="Success Message" />);
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });

  test('does not render when no message', () => {
    const { container } = render(<Alert type="success" message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<Alert type="error" message="Error" onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
