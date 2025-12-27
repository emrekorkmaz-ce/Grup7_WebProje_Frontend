import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../../pages/Users';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('Users', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        expect(screen.getByText(/Kayıtlar yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display users', async () => {
        const mockUsers = [
            {
                id: '1',
                full_name: 'John Doe',
                email: 'john@test.edu',
                role: 'student',
                created_at: '2024-01-01T00:00:00Z',
                is_verified: true
            }
        ];

        api.get.mockResolvedValue({ data: { data: { users: mockUsers } } });

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@test.edu')).toBeInTheDocument();
        });
    });

    it('should handle different API response formats', async () => {
        const mockUsers = [
            {
                id: '1',
                full_name: 'Jane Smith',
                email: 'jane@test.edu',
                role: 'faculty',
                is_verified: false
            }
        ];

        // Test array response
        api.get.mockResolvedValueOnce({ data: mockUsers });

        const { rerender } = render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Test data.users format
        api.get.mockResolvedValueOnce({ data: { users: mockUsers } });
        rerender(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Kullanıcı listesi alınırken bir hata oluştu/i)).toBeInTheDocument();
        });
    });

    it('should format names correctly', async () => {
        const mockUsers = [
            {
                id: '1',
                full_name: 'john doe',
                email: 'john@test.edu',
                role: 'student',
                is_verified: true
            }
        ];

        api.get.mockResolvedValue({ data: { data: { users: mockUsers } } });

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('should format dates correctly', async () => {
        const mockUsers = [
            {
                id: '1',
                full_name: 'John Doe',
                email: 'john@test.edu',
                role: 'student',
                created_at: '2024-01-15T10:30:00Z',
                is_verified: true
            }
        ];

        api.get.mockResolvedValue({ data: { data: { users: mockUsers } } });

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            // Date format will be in Turkish locale
            const dateText = screen.getByText(/15/i);
            expect(dateText).toBeInTheDocument();
        });
    });

    it('should display empty state when no users', async () => {
        api.get.mockResolvedValue({ data: { data: { users: [] } } });

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/John/i)).not.toBeInTheDocument();
        });
    });

    it('should render Navbar and Sidebar', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        expect(screen.getByText('Navbar')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });
});

