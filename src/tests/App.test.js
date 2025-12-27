// src/tests/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock all page components
jest.mock('../pages/Login', () => () => <div>Login Page</div>);
jest.mock('../pages/Register', () => () => <div>Register Page</div>);
jest.mock('../pages/VerifyEmail', () => () => <div>Verify Email Page</div>);
jest.mock('../pages/ForgotPassword', () => () => <div>Forgot Password Page</div>);
jest.mock('../pages/ResetPassword', () => () => <div>Reset Password Page</div>);
jest.mock('../pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../pages/Profile', () => () => <div>Profile Page</div>);
jest.mock('../pages/Users', () => () => <div>Users Page</div>);
jest.mock('../pages/NotFound', () => () => <div>Not Found Page</div>);
jest.mock('../pages/MyCoursesPage', () => () => <div>My Courses Page</div>);
jest.mock('../pages/GradesPage', () => () => <div>Grades Page</div>);
jest.mock('../pages/GradebookPage', () => () => <div>Gradebook Page</div>);
jest.mock('../pages/StartAttendancePage', () => () => <div>Start Attendance Page</div>);
jest.mock('../pages/GiveAttendancePage', () => () => <div>Give Attendance Page</div>);
jest.mock('../pages/MyAttendancePage', () => () => <div>My Attendance Page</div>);
jest.mock('../pages/AttendanceReportPage', () => () => <div>Attendance Report Page</div>);
jest.mock('../pages/ExcuseRequestsPage', () => () => <div>Excuse Requests Page</div>);
jest.mock('../pages/EnrollCoursesPage', () => () => <div>Enroll Courses Page</div>);
jest.mock('../pages/MealMenuPage', () => () => <div>Meal Menu Page</div>);
jest.mock('../pages/MyReservationsPage', () => () => <div>My Reservations Page</div>);
jest.mock('../pages/MealScanPage', () => () => <div>Meal Scan Page</div>);
jest.mock('../pages/WalletPage', () => () => <div>Wallet Page</div>);
jest.mock('../pages/EventsPage', () => () => <div>Events Page</div>);
jest.mock('../pages/EventDetailPage', () => () => <div>Event Detail Page</div>);
jest.mock('../pages/MyEventsPage', () => () => <div>My Events Page</div>);
jest.mock('../pages/EventCheckInPage', () => () => <div>Event Check In Page</div>);
jest.mock('../pages/MySchedulePage', () => () => <div>My Schedule Page</div>);
jest.mock('../pages/ClassroomReservationsPage', () => () => <div>Classroom Reservations Page</div>);

// Mock ProtectedRoute
jest.mock('../components/ProtectedRoute', () => ({ children }) => <div data-testid="protected-route">{children}</div>);

describe('App Component', () => {
    it('should render login page for /login route', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render register page for /register route', () => {
        render(
            <MemoryRouter initialEntries={['/register']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Register Page')).toBeInTheDocument();
    });

    it('should render verify email page for /verify-email/:token route', () => {
        render(
            <MemoryRouter initialEntries={['/verify-email/test-token']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Verify Email Page')).toBeInTheDocument();
    });

    it('should render forgot password page for /forgot-password route', () => {
        render(
            <MemoryRouter initialEntries={['/forgot-password']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Forgot Password Page')).toBeInTheDocument();
    });

    it('should render reset password page for /reset-password/:token route', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/test-token']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Reset Password Page')).toBeInTheDocument();
    });

    it('should render dashboard page for /dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('should render profile page for /profile route', () => {
        render(
            <MemoryRouter initialEntries={['/profile']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });

    it('should render users page for /users route', () => {
        render(
            <MemoryRouter initialEntries={['/users']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Users Page')).toBeInTheDocument();
    });

    it('should render not found page for unknown routes', () => {
        render(
            <MemoryRouter initialEntries={['/unknown-route']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    it('should redirect root path to /login', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        // Should redirect to login
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render my courses page for /my-courses route', () => {
        render(
            <MemoryRouter initialEntries={['/my-courses']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('My Courses Page')).toBeInTheDocument();
    });

    it('should render grades page for /grades route', () => {
        render(
            <MemoryRouter initialEntries={['/grades']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Grades Page')).toBeInTheDocument();
    });

    it('should render gradebook page for /gradebook/:sectionId route', () => {
        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Gradebook Page')).toBeInTheDocument();
    });

    it('should render start attendance page for /attendance/start route', () => {
        render(
            <MemoryRouter initialEntries={['/attendance/start']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Start Attendance Page')).toBeInTheDocument();
    });

    it('should render give attendance page for /attendance/give/:sessionId route', () => {
        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Give Attendance Page')).toBeInTheDocument();
    });

    it('should render my attendance page for /my-attendance route', () => {
        render(
            <MemoryRouter initialEntries={['/my-attendance']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('My Attendance Page')).toBeInTheDocument();
    });

    it('should render attendance report page for /attendance/report/:sectionId route', () => {
        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Attendance Report Page')).toBeInTheDocument();
    });

    it('should render excuse requests page for /excuse-requests route', () => {
        render(
            <MemoryRouter initialEntries={['/excuse-requests']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Excuse Requests Page')).toBeInTheDocument();
    });

    it('should render enroll courses page for /enroll-courses route', () => {
        render(
            <MemoryRouter initialEntries={['/enroll-courses']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Enroll Courses Page')).toBeInTheDocument();
    });

    it('should render meal menu page for /meals/menu route', () => {
        render(
            <MemoryRouter initialEntries={['/meals/menu']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Meal Menu Page')).toBeInTheDocument();
    });

    it('should render my reservations page for /meals/reservations route', () => {
        render(
            <MemoryRouter initialEntries={['/meals/reservations']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('My Reservations Page')).toBeInTheDocument();
    });

    it('should render meal scan page for /meals/scan route', () => {
        render(
            <MemoryRouter initialEntries={['/meals/scan']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Meal Scan Page')).toBeInTheDocument();
    });

    it('should render wallet page for /wallet route', () => {
        render(
            <MemoryRouter initialEntries={['/wallet']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Wallet Page')).toBeInTheDocument();
    });

    it('should render events page for /events route', () => {
        render(
            <MemoryRouter initialEntries={['/events']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Events Page')).toBeInTheDocument();
    });

    it('should render event detail page for /events/:id route', () => {
        render(
            <MemoryRouter initialEntries={['/events/123']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Event Detail Page')).toBeInTheDocument();
    });

    it('should render my events page for /my-events route', () => {
        render(
            <MemoryRouter initialEntries={['/my-events']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('My Events Page')).toBeInTheDocument();
    });

    it('should render event check in page for /events/checkin route', () => {
        render(
            <MemoryRouter initialEntries={['/events/checkin']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Event Check In Page')).toBeInTheDocument();
    });

    it('should render my schedule page for /schedule route', () => {
        render(
            <MemoryRouter initialEntries={['/schedule']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('My Schedule Page')).toBeInTheDocument();
    });

    it('should render classroom reservations page for /reservations route', () => {
        render(
            <MemoryRouter initialEntries={['/reservations']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Classroom Reservations Page')).toBeInTheDocument();
    });

    it('should have AuthProvider wrapper', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });
});

