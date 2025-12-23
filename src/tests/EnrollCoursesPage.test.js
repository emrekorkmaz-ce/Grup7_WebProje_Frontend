import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import EnrollCoursesPage from '../pages/EnrollCoursesPage';
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

// Mock Navbar and Sidebar
jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

// Mock window.alert
global.alert = jest.fn();

const renderWithProviders = (component) => {
    return render(
        <MemoryRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('EnrollCoursesPage Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert.mockClear();
    });

    const mockCourses = [
        {
            sectionId: 'section-1',
            courseCode: 'CS101',
            courseName: 'Introduction to Computer Science',
            sectionNumber: '01',
            instructorName: 'Dr. John Doe',
            enrolledCount: 25,
            capacity: 30,
            credits: 3
        },
        {
            sectionId: 'section-2',
            courseCode: 'MATH201',
            courseName: 'Calculus I',
            sectionNumber: '02',
            instructorName: 'Dr. Jane Smith',
            enrolledCount: 30,
            capacity: 30,
            credits: 4
        },
        {
            sectionId: 'section-3',
            courseCode: 'ENG101',
            courseName: 'English Composition',
            sectionNumber: '01',
            instructorName: null,
            enrolledCount: 15,
            capacity: 25,
            credits: 3
        }
    ];

    describe('Course List Display', () => {
        it('should display loading state while fetching courses', () => {
            api.get.mockImplementation(() => new Promise(() => {}));

            renderWithProviders(<EnrollCoursesPage />);

            expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
        });

        it('should fetch courses on mount', async () => {
            api.get.mockResolvedValue({
                data: mockCourses
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/student/available-courses');
            });
        });

        it('should display error message when courses fetch fails', async () => {
            api.get.mockRejectedValue({
                response: {
                    data: {
                        error: 'Failed to fetch courses'
                    }
                }
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(screen.getByText(/Dersler yüklenemedi/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display "no courses" message when courses list is empty', async () => {
            api.get.mockResolvedValue({
                data: []
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(screen.getByText(/Şu anda kayıt için uygun ders bulunamadı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display courses list when courses are available', async () => {
            api.get.mockResolvedValue({
                data: mockCourses
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
                expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
                expect(screen.getByText('MATH201')).toBeInTheDocument();
                expect(screen.getByText('Calculus I')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display course details correctly', async () => {
            api.get.mockResolvedValue({
                data: mockCourses
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(screen.getByText(/Bölüm: 01/i)).toBeInTheDocument();
                expect(screen.getByText(/Öğretim Üyesi: Dr. John Doe/i)).toBeInTheDocument();
                expect(screen.getByText(/Kontenjan: 25\/30/i)).toBeInTheDocument();
                expect(screen.getByText(/Kredi: 3/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display "Belirtilmemiş" when instructor name is null', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[2]]
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                expect(screen.getByText(/Öğretim Üyesi: Belirtilmemiş/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Enrollment Form', () => {
        it('should display enroll button for available courses', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButtons = screen.getAllByText('Kayıt Ol');
                expect(enrollButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should disable enroll button when course is full', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[1]]
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const fullCourseButton = screen.getByText('Kontenjan Dolu');
                expect(fullCourseButton).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show "Kaydediliyor..." when enrollment is in progress', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            let resolveEnroll;
            const enrollPromise = new Promise((resolve) => {
                resolveEnroll = resolve;
            });
            api.post.mockReturnValue(enrollPromise);

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByText('Kaydediliyor...')).toBeInTheDocument();
            }, { timeout: 3000 });

            resolveEnroll({ data: { success: true } });
        });

        it('should call enroll API when enroll button is clicked', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/student/enroll', {
                    sectionId: 'section-1'
                });
            }, { timeout: 3000 });
        });

        it('should show success alert after successful enrollment', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Derse başarıyla kayıt oldunuz!');
            }, { timeout: 3000 });
        });

        it('should refresh courses list after successful enrollment', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                // Should call fetchAvailableCourses again
                expect(api.get).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });
        });

        it('should show error alert when enrollment fails', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            api.post.mockRejectedValue({
                response: {
                    data: {
                        error: 'Enrollment failed: Schedule conflict'
                    }
                }
            });

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Kayıt başarısız: Enrollment failed: Schedule conflict');
            }, { timeout: 3000 });
        });

        it('should show error alert when enrollment fails with network error', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            api.post.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Kayıt başarısız: Network error');
            }, { timeout: 3000 });
        });

        it('should disable button while enrolling', async () => {
            api.get.mockResolvedValue({
                data: [mockCourses[0]]
            });

            let resolveEnroll;
            const enrollPromise = new Promise((resolve) => {
                resolveEnroll = resolve;
            });
            api.post.mockReturnValue(enrollPromise);

            renderWithProviders(<EnrollCoursesPage />);

            await waitFor(() => {
                const enrollButton = screen.getByText('Kayıt Ol');
                fireEvent.click(enrollButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                const loadingButton = screen.getByText('Kaydediliyor...');
                expect(loadingButton).toBeDisabled();
            }, { timeout: 3000 });

            resolveEnroll({ data: { success: true } });
        });
    });
});




