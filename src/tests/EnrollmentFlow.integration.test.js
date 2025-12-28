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

describe('Enrollment Flow Integration Tests', () => {
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
            instructorName: 'Dr. Alice Johnson',
            enrolledCount: 15,
            capacity: 25,
            credits: 3
        }
    ];

    describe('Complete Enrollment Flow', () => {
        it('should complete full enrollment flow: fetch courses -> select course -> enroll -> refresh', async () => {
            // Step 1: Initial fetch returns courses
            api.get.mockResolvedValueOnce({
                data: mockCourses
            });

            // Step 2: After enrollment, refresh returns updated courses
            const updatedCourses = [
                {
                    ...mockCourses[0],
                    enrolledCount: 26
                },
                ...mockCourses.slice(1)
            ];
            api.get.mockResolvedValueOnce({
                data: updatedCourses
            });

            // Step 3: Enrollment API call succeeds
            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            // Step 1: Verify courses are loaded
            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
                expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
                expect(screen.getByText('MATH201')).toBeInTheDocument();
                expect(screen.getByText('ENG101')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 2: Verify enroll button is available for available courses
            const enrollButtons = screen.getAllByText('Kayıt Ol');
            expect(enrollButtons.length).toBeGreaterThan(0);

            // Step 3: Click enroll button for first course
            const firstEnrollButton = screen.getAllByText('Kayıt Ol')[0];
            fireEvent.click(firstEnrollButton);

            // Step 4: Verify loading state
            await waitFor(() => {
                expect(screen.getByText('Kaydediliyor...')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 5: Verify enrollment API was called
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/student/enroll', {
                    sectionId: 'section-1'
                });
            }, { timeout: 3000 });

            // Step 6: Verify success alert
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Derse başarıyla kayıt oldunuz!');
            }, { timeout: 3000 });

            // Step 7: Verify courses list is refreshed
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });
        });

        it('should handle enrollment flow with multiple courses', async () => {
            // Initial courses
            api.get.mockResolvedValueOnce({
                data: mockCourses
            });

            // After first enrollment
            api.get.mockResolvedValueOnce({
                data: [
                    { ...mockCourses[0], enrolledCount: 26 },
                    ...mockCourses.slice(1)
                ]
            });

            // After second enrollment
            api.get.mockResolvedValueOnce({
                data: [
                    { ...mockCourses[0], enrolledCount: 26 },
                    { ...mockCourses[2], enrolledCount: 16 }
                ]
            });

            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            // Wait for courses to load
            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Enroll in first course
            const enrollButtons = screen.getAllByText('Kayıt Ol');
            fireEvent.click(enrollButtons[0]);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/student/enroll', {
                    sectionId: 'section-1'
                });
            }, { timeout: 3000 });

            // Wait for refresh
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });

            // Enroll in third course (ENG101)
            await waitFor(() => {
                const newEnrollButtons = screen.getAllByText('Kayıt Ol');
                if (newEnrollButtons.length > 0) {
                    fireEvent.click(newEnrollButtons[newEnrollButtons.length - 1]);
                }
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/student/enroll', {
                    sectionId: 'section-3'
                });
            }, { timeout: 3000 });

            // Verify courses list is refreshed again
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(3);
            }, { timeout: 3000 });
        });

        it('should handle enrollment failure and allow retry', async () => {
            // Initial courses
            api.get.mockResolvedValueOnce({
                data: mockCourses
            });

            // First enrollment attempt fails
            api.post.mockRejectedValueOnce({
                response: {
                    data: {
                        error: 'Schedule conflict detected'
                    }
                }
            });

            // Second enrollment attempt succeeds
            api.post.mockResolvedValueOnce({
                data: { success: true }
            });

            // Refresh after successful enrollment
            api.get.mockResolvedValueOnce({
                data: [
                    { ...mockCourses[0], enrolledCount: 26 },
                    ...mockCourses.slice(1)
                ]
            });

            renderWithProviders(<EnrollCoursesPage />);

            // Wait for courses to load
            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
            }, { timeout: 3000 });

            // First enrollment attempt
            const enrollButtons = screen.getAllByText('Kayıt Ol');
            fireEvent.click(enrollButtons[0]);

            // Verify error alert
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Kayıt başarısız: Schedule conflict detected');
            }, { timeout: 3000 });

            // Verify courses list is NOT refreshed after failure
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(1);
            }, { timeout: 3000 });

            // Retry enrollment
            const retryButtons = screen.getAllByText('Kayıt Ol');
            fireEvent.click(retryButtons[0]);

            // Verify success on retry
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Derse başarıyla kayıt oldunuz!');
            }, { timeout: 3000 });

            // Verify courses list is refreshed after success
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });
        });

        it('should handle full capacity enrollment prevention', async () => {
            // Initial courses with one full course
            api.get.mockResolvedValue({
                data: mockCourses
            });

            renderWithProviders(<EnrollCoursesPage />);

            // Wait for courses to load
            await waitFor(() => {
                expect(screen.getByText('MATH201')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify full course button is disabled
            const fullCourseButton = screen.getByText('Kontenjan Dolu');
            expect(fullCourseButton).toBeDisabled();

            // Verify enroll API is not called for full course
            expect(api.post).not.toHaveBeenCalled();
        });

        it('should maintain course list state during enrollment process', async () => {
            // Initial courses
            api.get.mockResolvedValueOnce({
                data: mockCourses
            });

            // After enrollment refresh
            api.get.mockResolvedValueOnce({
                data: [
                    { ...mockCourses[0], enrolledCount: 26 },
                    ...mockCourses.slice(1)
                ]
            });

            api.post.mockResolvedValue({
                data: { success: true }
            });

            renderWithProviders(<EnrollCoursesPage />);

            // Wait for courses to load
            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
                expect(screen.getByText('MATH201')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify initial state shows correct enrollment count
            expect(screen.getByText(/Kontenjan: 25\/30/i)).toBeInTheDocument();

            // Enroll in course
            const enrollButtons = screen.getAllByText('Kayıt Ol');
            fireEvent.click(enrollButtons[0]);

            // Wait for enrollment to complete and refresh
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });

            // Verify updated enrollment count is displayed
            await waitFor(() => {
                expect(screen.getByText(/Kontenjan: 26\/30/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});














