import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExcuseRequestsPage from '../../pages/ExcuseRequestsPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('ExcuseRequestsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display excuse requests', async () => {
        const mockRequests = [
            {
                id: '1',
                studentName: 'John Doe',
                courseName: 'CS101',
                date: '2024-01-15',
                reason: 'Illness',
                status: 'pending'
            }
        ];

        api.get.mockResolvedValue({ data: mockRequests });

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('CS101')).toBeInTheDocument();
            expect(screen.getByText('Illness')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Mazeret talepleri yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no requests', async () => {
        api.get.mockResolvedValue({ data: [] });

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Mazeret talebi bulunmamaktadır/i)).toBeInTheDocument();
        });
    });

    it('should handle approve action', async () => {
        const mockRequests = [
            {
                id: '1',
                studentName: 'John Doe',
                courseName: 'CS101',
                date: '2024-01-15',
                reason: 'Illness',
                status: 'pending'
            }
        ];

        api.get.mockResolvedValue({ data: mockRequests });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const approveButton = screen.getByText(/Onayla/i);
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/faculty/excuse-requests/1/approve');
        });
    });

    it('should handle reject action', async () => {
        const mockRequests = [
            {
                id: '1',
                studentName: 'John Doe',
                courseName: 'CS101',
                date: '2024-01-15',
                reason: 'Illness',
                status: 'pending'
            }
        ];

        api.get.mockResolvedValue({ data: mockRequests });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const rejectButton = screen.getByText(/Reddet/i);
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/faculty/excuse-requests/1/reject');
        });
    });

    it('should display status badges correctly', async () => {
        const mockRequests = [
            {
                id: '1',
                studentName: 'John Doe',
                courseName: 'CS101',
                date: '2024-01-15',
                reason: 'Illness',
                status: 'approved'
            },
            {
                id: '2',
                studentName: 'Jane Smith',
                courseName: 'MATH101',
                date: '2024-01-16',
                reason: 'Family emergency',
                status: 'rejected'
            }
        ];

        api.get.mockResolvedValue({ data: mockRequests });

        render(
            <MemoryRouter>
                <ExcuseRequestsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Onaylandı')).toBeInTheDocument();
            expect(screen.getByText('Reddedildi')).toBeInTheDocument();
        });
    });
});

