import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MealScanPage from '../../pages/MealScanPage';
import api from '../../services/api';

jest.mock('../../services/api');

describe('MealScanPage', () => {
    const mockReservations = [
        {
            id: '1',
            qr_code: 'QR-123',
            status: 'reserved',
            meal_type: 'lunch',
            date: '2024-12-31',
            user: { fullName: 'Test User', email: 'test@test.edu' },
            menu: { cafeteria: { name: 'Test Cafeteria', location: 'Test Location' } }
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render meal scan page', () => {
        render(<MealScanPage />);

        expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/QR kodu buraya girin/i)).toBeInTheDocument();
    });

    it('should handle QR code input', () => {
        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });

        expect(input.value).toBe('QR-123');
    });

    it('should show error when QR code is empty', async () => {
        render(<MealScanPage />);

        const button = screen.getByText(/Tara ve Kullan/i);
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Lütfen QR kod girin/i)).toBeInTheDocument();
        });
    });

    it('should handle scan with valid QR code', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });
        api.post.mockResolvedValue({ data: { data: mockReservations[0] } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/meals/reservations/my-reservations');
            expect(api.post).toHaveBeenCalledWith('/meals/reservations/1/use', {
                qr_code: 'QR-123'
            });
        });
    });

    it('should display error for invalid QR code', async () => {
        api.get.mockResolvedValue({ data: { data: [] } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'INVALID-QR' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(screen.getByText(/Geçersiz QR kod/i)).toBeInTheDocument();
        });
    });

    it('should display error for already used reservation', async () => {
        const usedReservation = { ...mockReservations[0], status: 'used' };
        api.get.mockResolvedValue({ data: { data: [usedReservation] } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(screen.getByText(/Bu rezervasyon zaten kullanılmış/i)).toBeInTheDocument();
        });
    });

    it('should display success message after scan', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });
        api.post.mockResolvedValue({ data: { data: mockReservations[0] } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(screen.getByText(/Başarılı/i)).toBeInTheDocument();
            expect(screen.getByText(/Yemek başarıyla kullanıldı/i)).toBeInTheDocument();
        });
    });

    it('should handle scan error', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });
        api.post.mockRejectedValue({ response: { data: { error: 'Scan failed' } } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(screen.getByText(/Scan failed/i)).toBeInTheDocument();
        });
    });

    it('should handle Enter key press', () => {
        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

        expect(api.get).toHaveBeenCalled();
    });

    it('should clear form after successful scan', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });
        api.post.mockResolvedValue({ data: { data: mockReservations[0] } });

        render(<MealScanPage />);

        const input = screen.getByPlaceholderText(/QR kodu buraya girin/i);
        fireEvent.change(input, { target: { value: 'QR-123' } });
        fireEvent.click(screen.getByText(/Tara ve Kullan/i));

        await waitFor(() => {
            expect(input.value).toBe('');
        });
    });
});

