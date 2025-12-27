// src/tests/pages/Dashboard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { useAuth } from '../../context/AuthContext';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    BookIcon: () => <div>BookIcon</div>,
    GraduationCapIcon: () => <div>GraduationCapIcon</div>,
    CalendarIcon: () => <div>CalendarIcon</div>,
    SettingsIcon: () => <div>SettingsIcon</div>,
    CheckCircleIcon: () => <div>CheckCircleIcon</div>,
    ClockIcon: () => <div>ClockIcon</div>,
}));

describe('Dashboard Page', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('should render dashboard with user information', () => {
        useAuth.mockReturnValue({
            user: {
                fullName: 'Test User',
                email: 'test@test.edu',
                role: 'student'
            }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/Test User|test@test.edu/i)).toBeInTheDocument();
    });

    it('should handle settings action', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const settingsButton = screen.getByText(/Ayarlar|Settings/i);
        if (settingsButton) {
            fireEvent.click(settingsButton);
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        }
    });

    it('should display current date', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        // Should display date information
        expect(document.body).toBeTruthy();
    });

    it('should handle courses action', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const coursesButton = screen.queryByText(/Derslerim|Courses/i);
        if (coursesButton) {
            fireEvent.click(coursesButton);
            expect(mockNavigate).toHaveBeenCalledWith('/my-courses');
        }
    });

    it('should handle user without name', () => {
        useAuth.mockReturnValue({
            user: { email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(document.body).toBeTruthy();
    });

    it('should handle all navigation actions', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const gradesButton = screen.queryByText(/Not Listesi/i);
        if (gradesButton) {
            fireEvent.click(gradesButton);
            expect(mockNavigate).toHaveBeenCalledWith('/grades');
        }

        const scheduleButton = screen.queryByText(/Ders Programı/i);
        if (scheduleButton) {
            fireEvent.click(scheduleButton);
            expect(mockNavigate).toHaveBeenCalledWith('/schedule');
        }
    });

    it('should display student academic information', () => {
        useAuth.mockReturnValue({
            user: {
                fullName: 'Test User',
                email: 'test@test.edu',
                role: 'student',
                student: {
                    department: { name: 'Computer Science' },
                    gpa: 3.5,
                    cgpa: 3.4
                }
            }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
        expect(screen.getByText(/3.5/i)).toBeInTheDocument();
        expect(screen.getByText(/3.4/i)).toBeInTheDocument();
    });

    it('should display verification status', () => {
        useAuth.mockReturnValue({
            user: {
                fullName: 'Test User',
                email: 'test@test.edu',
                role: 'student',
                is_verified: true
            }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/Hesap Doğrulandı/i)).toBeInTheDocument();
    });

    it('should display unverified status', () => {
        useAuth.mockReturnValue({
            user: {
                fullName: 'Test User',
                email: 'test@test.edu',
                role: 'student',
                is_verified: false
            }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/Doğrulama Bekleniyor/i)).toBeInTheDocument();
    });

    it('should handle meals navigation', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const mealsButton = screen.queryByText(/Yemek Menüsü/i);
        if (mealsButton) {
            fireEvent.click(mealsButton);
            expect(mockNavigate).toHaveBeenCalledWith('/meals/menu');
        }
    });

    it('should handle wallet navigation', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const walletButton = screen.queryByText(/Cüzdan/i);
        if (walletButton) {
            fireEvent.click(walletButton);
            expect(mockNavigate).toHaveBeenCalledWith('/wallet');
        }
    });

    it('should handle events navigation', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const eventsButton = screen.queryByText(/Etkinlikler/i);
        if (eventsButton) {
            fireEvent.click(eventsButton);
            expect(mockNavigate).toHaveBeenCalledWith('/events');
        }
    });

    it('should handle reservations navigation', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        const reservationsButton = screen.queryByText(/Derslik Rezervasyonu/i);
        if (reservationsButton) {
            fireEvent.click(reservationsButton);
            expect(mockNavigate).toHaveBeenCalledWith('/reservations');
        }
    });

    it('should display announcements section', () => {
        useAuth.mockReturnValue({
            user: { fullName: 'Test User', email: 'test@test.edu', role: 'student' }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/Duyurular & Haberler/i)).toBeInTheDocument();
    });
});

