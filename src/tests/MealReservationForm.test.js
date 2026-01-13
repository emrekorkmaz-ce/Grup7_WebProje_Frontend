import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MealMenuPage from '../pages/MealMenuPage';
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

// Mock window.alert
global.alert = jest.fn();

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

describe('Meal Reservation Form Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert.mockClear();
    });

    const mockMenus = [
        {
            id: 'menu-1',
            cafeteria_id: 'cafe-1',
            meal_type: 'lunch',
            items_json: {
                main: 'Köfte',
                side: 'Pilav',
                dessert: 'Baklava'
            },
            nutrition_json: {
                calories: 650,
                protein: 35,
                carbs: 55,
                fat: 25
            },
            cafeteria: {
                id: 'cafe-1',
                name: 'Ana Kafeterya',
                location: 'A Blok'
            }
        },
        {
            id: 'menu-2',
            cafeteria_id: 'cafe-2',
            meal_type: 'dinner',
            items_json: {
                main: 'Balık',
                side: 'Salata',
                dessert: 'Meyve'
            },
            cafeteria: {
                id: 'cafe-2',
                name: 'Yan Kafeterya',
                location: 'B Blok'
            }
        }
    ];

    describe('Meal Menu Page - Reservation Flow', () => {
        it('should display meal menus on load', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockMenus
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/meals/menus'));
            });

            expect(screen.getByText('Yemek Menüsü')).toBeInTheDocument();
        });

        it('should show loading state initially', () => {
            api.get.mockImplementation(() => new Promise(() => {}));

            renderWithProviders(<MealMenuPage />);

            expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
        });

        it('should display error message when menu fetch fails', async () => {
            api.get.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(screen.getByText(/Menüler yüklenemedi/i)).toBeInTheDocument();
            });
        });

        it('should display menus grouped by meal type', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockMenus
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(screen.getByText('Öğle Yemeği')).toBeInTheDocument();
                expect(screen.getByText('Akşam Yemeği')).toBeInTheDocument();
            });
        });

        it('should filter menus by selected date', async () => {
            const selectedDate = '2025-01-20';
            api.get.mockResolvedValue({
                data: {
                    data: mockMenus
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining(selectedDate));
            });
        });
    });

    describe('Meal Card Component', () => {
        it('should display meal card with menu details', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(screen.getByText('Ana Kafeterya')).toBeInTheDocument();
                expect(screen.getByText(/Köfte/i)).toBeInTheDocument();
                expect(screen.getByText(/Pilav/i)).toBeInTheDocument();
            });
        });

        it('should display nutrition information when available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(screen.getByText(/650 kcal/i)).toBeInTheDocument();
                expect(screen.getByText(/35g/i)).toBeInTheDocument();
            });
        });

        it('should display reserve button for each meal', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockMenus
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButtons = screen.getAllByText('Rezerve Et');
                expect(reserveButtons.length).toBeGreaterThan(0);
            });
        });

        it('should handle reserve button click', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Rezervasyon Onayı')).toBeInTheDocument();
            });
        });
    });

    describe('Reservation Modal Component', () => {
        it('should open reservation modal when reserve button is clicked', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Rezervasyon Onayı')).toBeInTheDocument();
            });
        });

        it('should display reservation details in modal', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Rezervasyon Onayı')).toBeInTheDocument();
                expect(screen.getByText(/Ana Kafeterya/i)).toBeInTheDocument();
                expect(screen.getByText(/Köfte/i)).toBeInTheDocument();
            });
        });

        it('should close modal when cancel button is clicked', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                const cancelButton = screen.getByText('İptal');
                fireEvent.click(cancelButton);
            });

            await waitFor(() => {
                expect(screen.queryByText('Rezervasyon Onayı')).not.toBeInTheDocument();
            });
        });

        it('should create reservation when confirm button is clicked', async () => {
            const selectedDate = new Date().toISOString().split('T')[0];
            
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'reservation-1',
                        menu_id: 'menu-1'
                    }
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Onayla');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/meals/reservations', {
                    menu_id: 'menu-1',
                    cafeteria_id: 'cafe-1',
                    meal_type: 'lunch',
                    date: selectedDate,
                    amount: 0
                });
            });

            expect(global.alert).toHaveBeenCalledWith('Rezervasyon başarıyla oluşturuldu!');
        });

        it('should show error alert when reservation creation fails', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            api.post.mockRejectedValue({
                response: {
                    data: {
                        error: 'Yetersiz bakiye'
                    }
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Onayla');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Yetersiz bakiye');
            });
        });

        it('should close modal after successful reservation', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'reservation-1'
                    }
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Onayla');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(screen.queryByText('Rezervasyon Onayı')).not.toBeInTheDocument();
            });
        });

        it('should refresh menus after successful reservation', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: [mockMenus[0]]
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'reservation-1'
                    }
                }
            });

            renderWithProviders(<MealMenuPage />);

            const initialCallCount = api.get.mock.calls.length;

            await waitFor(() => {
                const reserveButton = screen.getByText('Rezerve Et');
                fireEvent.click(reserveButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Onayla');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(api.get.mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });
    });

    describe('Date Selection', () => {
        it('should allow user to change selected date', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockMenus
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                const dateInput = screen.getByLabelText(/Tarih Seçin/i);
                expect(dateInput).toBeInTheDocument();
                
                fireEvent.change(dateInput, { target: { value: '2025-01-25' } });
            });

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('2025-01-25'));
            });
        });
    });

    describe('Empty State', () => {
        it('should display message when no menus available for selected date', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: []
                }
            });

            renderWithProviders(<MealMenuPage />);

            await waitFor(() => {
                expect(screen.getByText(/Bu tarih için menü bulunmamaktadır/i)).toBeInTheDocument();
            });
        });
    });
});
























