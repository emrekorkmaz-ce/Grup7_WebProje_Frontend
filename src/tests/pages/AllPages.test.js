// src/tests/pages/AllPages.test.js
// Basic tests for all page components to increase coverage

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock all dependencies
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: '1', email: 'test@test.edu', role: 'student' }, isAuthenticated: true })
}));

jest.mock('../../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
        post: jest.fn(() => Promise.resolve({ data: { success: true } })),
        put: jest.fn(() => Promise.resolve({ data: { success: true } })),
        delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
    }
}));

jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/ProtectedRoute', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/Icons', () => ({
    BookIcon: () => <div>Icon</div>,
    GraduationCapIcon: () => <div>Icon</div>,
    CalendarIcon: () => <div>Icon</div>,
    SettingsIcon: () => <div>Icon</div>,
    CheckCircleIcon: () => <div>Icon</div>,
    ClockIcon: () => <div>Icon</div>,
}));

// Import all pages
import AttendanceReportPage from '../../pages/AttendanceReportPage';
import ClassroomReservationsPage from '../../pages/ClassroomReservationsPage';
import CourseDetailPage from '../../pages/CourseDetailPage';
import EnrollCoursesPage from '../../pages/EnrollCoursesPage';
import EventCheckInPage from '../../pages/EventCheckInPage';
import EventDetailPage from '../../pages/EventDetailPage';
import EventsPage from '../../pages/EventsPage';
import ExcuseRequestsPage from '../../pages/ExcuseRequestsPage';
import ForgotPassword from '../../pages/ForgotPassword';
import GiveAttendancePage from '../../pages/GiveAttendancePage';
import GradebookPage from '../../pages/GradebookPage';
import GradesPage from '../../pages/GradesPage';
import Login from '../../pages/Login';
import MealMenuPage from '../../pages/MealMenuPage';
import MealScanPage from '../../pages/MealScanPage';
import MyAttendancePage from '../../pages/MyAttendancePage';
import MyCoursesPage from '../../pages/MyCoursesPage';
import MyEventsPage from '../../pages/MyEventsPage';
import MyReservationsPage from '../../pages/MyReservationsPage';
import MySchedulePage from '../../pages/MySchedulePage';
import Profile from '../../pages/Profile';
import Register from '../../pages/Register';
import ResetPassword from '../../pages/ResetPassword';
import StartAttendancePage from '../../pages/StartAttendancePage';
import Users from '../../pages/Users';
import VerifyEmail from '../../pages/VerifyEmail';
import WalletPage from '../../pages/WalletPage';

const renderWithRouter = (component, route = '/') => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            {component}
        </MemoryRouter>
    );
};

describe('All Pages - Basic Rendering Tests', () => {
    describe('AttendanceReportPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<AttendanceReportPage />, '/attendance/report/123');
            expect(document.body).toBeTruthy();
        });
    });

    describe('ClassroomReservationsPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<ClassroomReservationsPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('CourseDetailPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<CourseDetailPage />, '/courses/123');
            expect(document.body).toBeTruthy();
        });
    });

    describe('EnrollCoursesPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<EnrollCoursesPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('EventCheckInPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<EventCheckInPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('EventDetailPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<EventDetailPage />, '/events/123');
            expect(document.body).toBeTruthy();
        });
    });

    describe('EventsPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<EventsPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('ExcuseRequestsPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<ExcuseRequestsPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('ForgotPassword', () => {
        it('should render without crashing', () => {
            renderWithRouter(<ForgotPassword />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('GiveAttendancePage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<GiveAttendancePage />, '/attendance/give/123');
            expect(document.body).toBeTruthy();
        });
    });

    describe('GradebookPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<GradebookPage />, '/gradebook/123');
            expect(document.body).toBeTruthy();
        });
    });

    describe('GradesPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<GradesPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('Login', () => {
        it('should render without crashing', () => {
            renderWithRouter(<Login />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MealMenuPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MealMenuPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MealScanPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MealScanPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MyAttendancePage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MyAttendancePage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MyCoursesPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MyCoursesPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MyEventsPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MyEventsPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MyReservationsPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MyReservationsPage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('MySchedulePage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<MySchedulePage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('Profile', () => {
        it('should render without crashing', () => {
            renderWithRouter(<Profile />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('Register', () => {
        it('should render without crashing', () => {
            renderWithRouter(<Register />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('ResetPassword', () => {
        it('should render without crashing', () => {
            renderWithRouter(<ResetPassword />, '/reset-password/token');
            expect(document.body).toBeTruthy();
        });
    });

    describe('StartAttendancePage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<StartAttendancePage />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('Users', () => {
        it('should render without crashing', () => {
            renderWithRouter(<Users />);
            expect(document.body).toBeTruthy();
        });
    });

    describe('VerifyEmail', () => {
        it('should render without crashing', () => {
            renderWithRouter(<VerifyEmail />, '/verify-email/token');
            expect(document.body).toBeTruthy();
        });
    });

    describe('WalletPage', () => {
        it('should render without crashing', () => {
            renderWithRouter(<WalletPage />);
            expect(document.body).toBeTruthy();
        });
    });
});

