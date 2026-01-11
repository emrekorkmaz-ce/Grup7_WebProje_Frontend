import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MealScanPage from '../pages/MealScanPage';
import api from '../services/api';

// Mock API
jest.mock('../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    }
}));

// Helper to render with providers
const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('QR Scanner Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockReservations = [
        {
            id: 'reservation-1',
            qr_code: 'MEAL-123e4567-e89b-12d3-a456-426614174000',
            status: 'reserved',
            meal_type: 'lunch',
            date: '2025-01-20',
            user: {
                id: 'user-1',
                fullName: 'John Doe',
                email: 'john@university.edu'
            },
            menu: {
                id: 'menu-1',
                cafeteria: {
                    id: 'cafe-1',
                    name: 'Ana Kafeterya'
                }
            }
        },
        {
            id: 'reservation-2',
            qr_code: 'MEAL-987fcdeb-51a2-43f1-9b2c-123456789abc',
            status: 'used',
            meal_type: 'dinner',
            date: '2025-01-19',
            user: {
                id: 'user-2',
                fullName: 'Jane Smith',
                email: 'jane@university.edu'
            },
            menu: {
                id: 'menu-2',
                cafeteria: {
                    id: 'cafe-2',
                    name: 'Yan Kafeterya'
                }
            }
        }
    ];

    describe('QR Scanner Initialization', () => {
        it('should render QR scanner page', () => {
            renderWithProviders(<MealScanPage />);

            expect(screen.getByText('QR Kod Tarayıcı')).toBeInTheDocument();
            expect(screen.getByText(/Kafeterya personeli için/i)).toBeInTheDocument();
        });

        it('should display QR code input field', () => {
            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder', /QR kodu buraya girin/i);
        });

        it('should display scan button', () => {
            renderWithProviders(<MealScanPage />);

            const scanButton = screen.getByText(/Tara ve Kullan/i);
            expect(scanButton).toBeInTheDocument();
        });

        it('should have scan button disabled when input is empty', () => {
            renderWithProviders(<MealScanPage />);

            const scanButton = screen.getByText(/Tara ve Kullan/i);
            expect(scanButton).toBeDisabled();
        });

        it('should display usage instructions', () => {
            renderWithProviders(<MealScanPage />);

            expect(screen.getByText(/Kullanım Talimatları/i)).toBeInTheDocument();
            expect(screen.getByText(/QR kod okutucu cihazdan/i)).toBeInTheDocument();
        });
    });

    describe('QR Code Input Handling', () => {
        it('should update QR code state when input changes', () => {
            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            fireEvent.change(input, { target: { value: 'MEAL-123' } });

            expect(input.value).toBe('MEAL-123');
        });

        it('should enable scan button when QR code is entered', () => {
            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: 'MEAL-123' } });

            expect(scanButton).not.toBeDisabled();
        });

        it('should disable scan button when QR code is cleared', () => {
            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: 'MEAL-123' } });
            fireEvent.change(input, { target: { value: '' } });

            expect(scanButton).toBeDisabled();
        });

        it('should handle Enter key press to trigger scan', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: mockReservations[0]
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    describe('QR Code Validation', () => {
        it('should show error when QR code is empty', async () => {
            renderWithProviders(<MealScanPage />);

            const scanButton = screen.getByText(/Tara ve Kullan/i);
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Lütfen QR kod girin/i)).toBeInTheDocument();
            });
        });

        it('should show error when QR code contains only whitespace', async () => {
            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Lütfen QR kod girin/i)).toBeInTheDocument();
            });
        });
    });

    describe('QR Code Scanning - Success Cases', () => {
        it('should successfully scan valid QR code', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: {
                        ...mockReservations[0],
                        status: 'used'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/meals/reservations/my-reservations');
            });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith(
                    `/meals/reservations/${mockReservations[0].id}/use`,
                    { qr_code: mockReservations[0].qr_code }
                );
            });
        });

        it('should display success message after successful scan', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: {
                        ...mockReservations[0],
                        status: 'used'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Başarılı/i)).toBeInTheDocument();
                expect(screen.getByText(/Yemek başarıyla kullanıldı/i)).toBeInTheDocument();
            });
        });

        it('should display reservation details after successful scan', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: {
                        ...mockReservations[0],
                        status: 'used'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(mockReservations[0].user.fullName)).toBeInTheDocument();
                expect(screen.getByText(mockReservations[0].user.email)).toBeInTheDocument();
                expect(screen.getByText(/Öğle Yemeği/i)).toBeInTheDocument();
            });
        });

        it('should clear QR code input after successful scan', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: {
                        ...mockReservations[0],
                        status: 'used'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(input.value).toBe('');
            });
        });

        it('should show loading state during scan', async () => {
            api.get.mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({
                    data: {
                        data: mockReservations
                    }
                }), 100);
            }));

            api.post.mockResolvedValue({
                data: {
                    data: mockReservations[0]
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            expect(screen.getByText(/İşleniyor/i)).toBeInTheDocument();
        });
    });

    describe('QR Code Scanning - Error Cases', () => {
        it('should show error when QR code is not found', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: 'MEAL-INVALID-CODE' } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Geçersiz QR kod/i)).toBeInTheDocument();
            });
        });

        it('should show error when reservation is already used', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[1].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/zaten kullanılmış/i)).toBeInTheDocument();
            });
        });

        it('should show error when API call fails', async () => {
            api.get.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: 'MEAL-123' } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/QR kod işlenemedi/i)).toBeInTheDocument();
            });
        });

        it('should show API error message when available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockRejectedValue({
                response: {
                    data: {
                        error: 'Rezervasyon kullanılamıyor'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Rezervasyon kullanılamıyor/i)).toBeInTheDocument();
            });
        });
    });

    describe('Clear and Reset Functionality', () => {
        it('should clear result and reset form when "New Scan" is clicked', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            api.post.mockResolvedValue({
                data: {
                    data: {
                        ...mockReservations[0],
                        status: 'used'
                    }
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Başarılı/i)).toBeInTheDocument();
            });

            const newScanButton = screen.getByText(/Yeni Tarama/i);
            fireEvent.click(newScanButton);

            await waitFor(() => {
                expect(screen.queryByText(/Başarılı/i)).not.toBeInTheDocument();
                expect(input.value).toBe('');
            });
        });

        it('should clear error messages when new scan is initiated', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockReservations
                }
            });

            renderWithProviders(<MealScanPage />);

            const input = screen.getByLabelText(/QR Kod/i);
            const scanButton = screen.getByText(/Tara ve Kullan/i);

            // First, trigger an error
            fireEvent.change(input, { target: { value: 'INVALID' } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.getByText(/Geçersiz QR kod/i)).toBeInTheDocument();
            });

            // Then clear and try again
            fireEvent.change(input, { target: { value: mockReservations[0].qr_code } });
            fireEvent.click(scanButton);

            await waitFor(() => {
                expect(screen.queryByText(/Geçersiz QR kod/i)).not.toBeInTheDocument();
            });
        });
    });
});






















