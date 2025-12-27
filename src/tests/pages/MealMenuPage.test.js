import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MealMenuPage from '../../pages/MealMenuPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('MealMenuPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display menus', async () => {
        const mockMenus = [
            {
                id: '1',
                mealType: 'lunch',
                items: ['Soup', 'Main Course'],
                cafeteria: { name: 'Main Cafeteria' }
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockMenus } });

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Öğle Yemeği/i)).toBeInTheDocument();
        });
    });

    it('should handle date change', async () => {
        const mockMenus = [];
        api.get.mockResolvedValue({ data: { data: mockMenus } });

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
            expect(dateInput).toBeInTheDocument();
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        api.get.mockResolvedValue({ data: { data: [] } });
        const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
        fireEvent.change(dateInput, { target: { value: tomorrowStr } });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining(`date=${tomorrowStr}`));
        });
    });

    it('should handle reservation', async () => {
        const mockMenus = [
            {
                id: '1',
                mealType: 'lunch',
                items: ['Soup', 'Main Course'],
                cafeteria: { id: '1', name: 'Main Cafeteria' }
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockMenus } });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Öğle Yemeği/i)).toBeInTheDocument();
        });

        const reserveButton = screen.getByText(/Rezervasyon Yap/i);
        if (reserveButton) {
            fireEvent.click(reserveButton);

            await waitFor(() => {
                const confirmButton = screen.getByText(/Onayla/i);
                if (confirmButton) {
                    fireEvent.click(confirmButton);
                }
            });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/meals/reservations', expect.any(Object));
            });
        }
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Menüler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no menus', async () => {
        api.get.mockResolvedValue({ data: { data: [] } });

        render(
            <MemoryRouter>
                <MealMenuPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/Öğle Yemeği/i)).not.toBeInTheDocument();
        });
    });
});

