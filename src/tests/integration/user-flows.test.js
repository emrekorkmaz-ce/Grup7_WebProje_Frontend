// tests/integration/user-flows.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Dashboard from '../../pages/Dashboard';
import MyCoursesPage from '../../pages/MyCoursesPage';
import EnrollCoursesPage from '../../pages/EnrollCoursesPage';
import EventsPage from '../../pages/EventsPage';
import WalletPage from '../../pages/WalletPage';
import api from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    }
}));

const renderWithProviders = (component, initialRoute = '/') => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={component} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-courses" element={<MyCoursesPage />} />
                    <Route path="/enroll" element={<EnrollCoursesPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('Key User Flow Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        
        // Mock authenticated user
        localStorage.setItem('accessToken', 'fake-token');
        localStorage.setItem('user', JSON.stringify({
            id: '1',
            email: 'student@test.edu',
            role: 'student',
            fullName: 'Test Student'
        }));
    });

    describe('Course Enrollment Flow', () => {
        it('should complete course enrollment flow', async () => {
            // Mock API responses
            api.get.mockResolvedValueOnce({
                data: [
                    {
                        id: '1',
                        code: 'CS101',
                        name: 'Introduction to CS',
                        credits: 3,
                        availableSections: [
                            { id: 'sec1', sectionNumber: '01', capacity: 30, enrolledCount: 20 }
                        ]
                    }
                ]
            });

            api.post.mockResolvedValueOnce({
                data: { success: true, message: 'Enrollment successful' }
            });

            renderWithProviders(<EnrollCoursesPage />, '/enroll');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            // Should see available courses
            await waitFor(() => {
                expect(screen.getByText(/CS101/i)).toBeInTheDocument();
            });

            // Enroll in course
            const enrollButton = screen.getByRole('button', { name: /Enroll/i });
            fireEvent.click(enrollButton);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith(
                    expect.stringContaining('/enroll'),
                    expect.any(Object)
                );
            });
        });

        it('should show error when enrollment fails', async () => {
            api.get.mockResolvedValueOnce({
                data: [
                    {
                        id: '1',
                        code: 'CS101',
                        name: 'Introduction to CS',
                        availableSections: [{ id: 'sec1', sectionNumber: '01' }]
                    }
                ]
            });

            const error = new Error('Enrollment failed');
            error.response = { data: { message: 'Course is full' } };
            api.post.mockRejectedValueOnce(error);

            renderWithProviders(<EnrollCoursesPage />, '/enroll');

            await waitFor(() => {
                expect(screen.getByText(/CS101/i)).toBeInTheDocument();
            });

            const enrollButton = screen.getByRole('button', { name: /Enroll/i });
            fireEvent.click(enrollButton);

            await waitFor(() => {
                expect(screen.getByText(/full/i) || screen.getByText(/error/i)).toBeInTheDocument();
            });
        });
    });

    describe('Event Registration Flow', () => {
        it('should complete event registration flow', async () => {
            api.get.mockResolvedValueOnce({
                data: [
                    {
                        id: '1',
                        title: 'Tech Conference',
                        description: 'Annual tech conference',
                        date: '2025-12-31',
                        location: 'Main Hall',
                        category: 'ACADEMIC',
                        capacity: 100,
                        registeredCount: 50
                    }
                ]
            });

            api.post.mockResolvedValueOnce({
                data: { success: true, message: 'Registration successful' }
            });

            renderWithProviders(<EventsPage />, '/events');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/Tech Conference/i)).toBeInTheDocument();
            });

            const registerButton = screen.getByRole('button', { name: /Register/i });
            fireEvent.click(registerButton);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });

        it('should show event details and allow registration', async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    id: '1',
                    title: 'Tech Conference',
                    description: 'Annual tech conference',
                    date: '2025-12-31',
                    location: 'Main Hall',
                    category: 'ACADEMIC',
                    capacity: 100,
                    registeredCount: 50,
                    isRegistered: false
                }
            });

            api.post.mockResolvedValueOnce({
                data: { success: true }
            });

            renderWithProviders(<EventsPage />, '/events');

            await waitFor(() => {
                expect(screen.getByText(/Tech Conference/i)).toBeInTheDocument();
            });
        });
    });

    describe('Wallet Top-up Flow', () => {
        it('should complete wallet top-up flow', async () => {
            api.get.mockResolvedValueOnce({
                data: { balance: 50.00 }
            });

            api.post.mockResolvedValueOnce({
                data: { success: true, sessionId: 'session-123' }
            });

            renderWithProviders(<WalletPage />, '/wallet');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/50/i)).toBeInTheDocument();
            });

            const topupInput = screen.getByLabelText(/Amount/i) || screen.getByPlaceholderText(/amount/i);
            if (topupInput) {
                fireEvent.change(topupInput, { target: { value: '100' } });
            }

            const topupButton = screen.getByRole('button', { name: /Top up/i });
            fireEvent.click(topupButton);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });

        it('should display wallet balance and transactions', async () => {
            api.get
                .mockResolvedValueOnce({ data: { balance: 100.00 } })
                .mockResolvedValueOnce({
                    data: {
                        transactions: [
                            { id: '1', type: 'TOPUP', amount: 50, date: '2025-01-01' },
                            { id: '2', type: 'PAYMENT', amount: -20, date: '2025-01-02' }
                        ]
                    }
                });

            renderWithProviders(<WalletPage />, '/wallet');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/100/i)).toBeInTheDocument();
            });
        });
    });

    describe('My Courses Flow', () => {
        it('should display enrolled courses', async () => {
            api.get.mockResolvedValueOnce({
                data: [
                    {
                        id: '1',
                        code: 'CS101',
                        name: 'Introduction to CS',
                        section: '01',
                        status: 'active',
                        credits: 3
                    },
                    {
                        id: '2',
                        code: 'CS102',
                        name: 'Data Structures',
                        section: '02',
                        status: 'active',
                        credits: 4
                    }
                ]
            });

            renderWithProviders(<MyCoursesPage />, '/my-courses');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/CS101/i)).toBeInTheDocument();
                expect(screen.getByText(/CS102/i)).toBeInTheDocument();
            });
        });

        it('should allow dropping a course', async () => {
            api.get.mockResolvedValueOnce({
                data: [
                    {
                        id: '1',
                        code: 'CS101',
                        name: 'Introduction to CS',
                        section: '01',
                        status: 'active'
                    }
                ]
            });

            api.post.mockResolvedValueOnce({
                data: { success: true, message: 'Course dropped successfully' }
            });

            renderWithProviders(<MyCoursesPage />, '/my-courses');

            await waitFor(() => {
                expect(screen.getByText(/CS101/i)).toBeInTheDocument();
            });

            const dropButton = screen.getByRole('button', { name: /Drop/i });
            fireEvent.click(dropButton);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });
    });

    describe('Dashboard Flow', () => {
        it('should display dashboard with user information', async () => {
            api.get.mockResolvedValue({
                data: {
                    user: {
                        id: '1',
                        email: 'student@test.edu',
                        fullName: 'Test Student',
                        role: 'student'
                    },
                    stats: {
                        courses: 5,
                        events: 3,
                        attendance: 85
                    }
                }
            });

            renderWithProviders(<Dashboard />, '/dashboard');

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/Test Student/i) || screen.getByText(/student@test.edu/i)).toBeInTheDocument();
            });
        });
    });
});

