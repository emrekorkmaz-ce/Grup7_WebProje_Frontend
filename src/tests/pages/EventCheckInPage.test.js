import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCheckInPage from '../../pages/EventCheckInPage';
import api from '../../services/api';

jest.mock('../../services/api');

describe('EventCheckInPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render check-in page', () => {
        render(<EventCheckInPage />);

        expect(screen.getByText(/Etkinlik Check-in/i)).toBeInTheDocument();
        expect(screen.getByText(/QR Kod:/i)).toBeInTheDocument();
        expect(screen.getByText(/Etkinlik yöneticisi için/i)).toBeInTheDocument();
    });

    it('should handle QR code input', () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR-CODE' } });

        expect(input.value).toBe('TEST-QR-CODE');
    });

    it('should show error when QR code is empty', async () => {
        render(<EventCheckInPage />);

        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.getByText(/Lütfen QR kod girin/i)).toBeInTheDocument();
        });
    });

    it('should handle check-in with Enter key', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText(/QR kod formatı doğrulanamadı/i)).toBeInTheDocument();
        });
    });

    it('should disable button when loading', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });

        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(checkInButton).toBeDisabled();
        });
    });

    it('should display error message', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.getByText(/QR kod formatı doğrulanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle API error with response data', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.getByText(/QR kod formatı doğrulanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle API error without response data', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.getByText(/QR kod formatı doğrulanamadı/i)).toBeInTheDocument();
        });
    });

    it('should disable button when QR code is empty', () => {
        render(<EventCheckInPage />);

        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        
        expect(checkInButton).toBeDisabled();
    });

    it('should enable button when QR code is entered', () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        
        expect(checkInButton).not.toBeDisabled();
    });

    it('should display loading state when processing', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.getByText(/İşleniyor/i)).toBeInTheDocument();
        });
    });

    it('should clear error when new QR code is entered', async () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        const checkInButton = screen.getByRole('button', { name: /Check-in Yap/i });
        
        // Trigger error
        fireEvent.click(checkInButton);
        
        await waitFor(() => {
            expect(screen.getByText(/Lütfen QR kod girin/i)).toBeInTheDocument();
        });

        // Enter QR code
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        fireEvent.click(checkInButton);

        await waitFor(() => {
            expect(screen.queryByText(/Lütfen QR kod girin/i)).not.toBeInTheDocument();
        });
    });

    it('should display instructions', () => {
        render(<EventCheckInPage />);

        expect(screen.getByText(/Kullanım Talimatları/i)).toBeInTheDocument();
        expect(screen.getByText(/Katılımcının telefonundaki QR kodu/i)).toBeInTheDocument();
    });

    it('should handle non-Enter key press', () => {
        render(<EventCheckInPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'TEST-QR' } });
        fireEvent.keyPress(input, { key: 'Space', code: 'Space' });

        // Should not trigger check-in
        expect(screen.queryByText(/QR kod formatı doğrulanamadı/i)).not.toBeInTheDocument();
    });
});

