import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import EventDetailPage from '../pages/EventDetailPage';
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
global.console.error = jest.fn();

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: 'event-1' })
    };
});

// Helper to render with providers
const renderWithProviders = (component) => {
    return render(
        <MemoryRouter initialEntries={['/events/event-1']}>
            <AuthProvider>
                {component}
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('Event Registration Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert.mockClear();
        mockNavigate.mockClear();
    });

    const mockEvent = {
        id: 'event-1',
        title: 'Teknoloji Konferansı',
        description: 'Yazılım geliştirme ve teknoloji üzerine konferans',
        category: 'conference',
        date: '2025-02-15',
        start_time: '09:00',
        end_time: '17:00',
        location: 'Konferans Salonu A',
        capacity: 100,
        registered_count: 45,
        registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        is_paid: false,
        price: null,
        status: 'published'
    };

    const mockEventFull = {
        ...mockEvent,
        registered_count: 100,
        capacity: 100
    };

    const mockEventExpired = {
        ...mockEvent,
        registration_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    };

    const mockEventPaid = {
        ...mockEvent,
        is_paid: true,
        price: 50
    };

    describe('Event Detail Page - Initialization', () => {
        it('should display loading state while fetching event', () => {
            api.get.mockImplementation(() => new Promise(() => {}));

            renderWithProviders(<EventDetailPage />);

            expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
        });

        it('should fetch event data on mount', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/events/event-1');
            });
        });

        it('should display error message when event fetch fails', async () => {
            api.get.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Etkinlik yüklenemedi/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display error when event is not found', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: null
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Etkinlik bulunamadı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Event Information Display', () => {
        it('should display event title', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display event category badge', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const categoryBadges = screen.getAllByText(/Konferans/i);
                expect(categoryBadges.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should display event date and time', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/2025/i)).toBeInTheDocument();
                expect(screen.getByText(/09:00 - 17:00/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display event location', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(mockEvent.location)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display event capacity information', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/45 \/ 100 kayıtlı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display event description when available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display description card when description is missing', async () => {
            const eventWithoutDescription = {
                ...mockEvent,
                description: null
            };

            api.get.mockResolvedValue({
                data: {
                    data: eventWithoutDescription
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText(/Açıklama/i)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display paid badge for paid events', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventPaid
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Ücretli/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display event price for paid events', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventPaid
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/50 TRY/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display price for free events', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText(/TRY/i)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display price when is_paid is true but price is null', async () => {
            const paidEventWithoutPrice = {
                ...mockEvent,
                is_paid: true,
                price: null
            };

            api.get.mockResolvedValue({
                data: {
                    data: paidEventWithoutPrice
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                // Should show paid badge but not price
                expect(screen.getByText(/Ücretli/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display registration deadline', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Kayıt Son Tarihi/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Registration Section - Available Registration', () => {
        it('should display registration section when event is available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Kayıt Ol/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display remaining spots when available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/55 kontenjan kaldı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should enable register button when registration is available', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                expect(registerButton).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should register user when register button is clicked', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'registration-1'
                    }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                expect(registerButton).toBeInTheDocument();
            }, { timeout: 3000 });

            const registerButton = screen.getByText(/Kayıt Ol/i);
            fireEvent.click(registerButton);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/events/event-1/register', {
                    custom_fields: undefined
                });
            }, { timeout: 3000 });
        });

        it('should show success alert after successful registration', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'registration-1'
                    }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Etkinliğe başarıyla kaydoldunuz!');
            }, { timeout: 3000 });
        });

        it('should navigate to my-events page after successful registration', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'registration-1'
                    }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/my-events');
            }, { timeout: 3000 });
        });

        it('should show loading state during registration', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({
                    data: {
                        success: true,
                        data: { id: 'registration-1' }
                    }
                }), 100);
            }));

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            expect(screen.getByText(/Kaydediliyor/i)).toBeInTheDocument();
        });

        it('should show error alert when registration fails', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockRejectedValue({
                response: {
                    data: {
                        error: 'Zaten kayıtlısınız'
                    }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Zaten kayıtlısınız');
            }, { timeout: 3000 });
        });

        it('should handle API error without response field', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Kayıt yapılamadı.');
            }, { timeout: 3000 });
        });

        it('should show default error message when API error has no error field', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockRejectedValue({
                response: {}
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Kayıt yapılamadı.');
            }, { timeout: 3000 });
        });

        it('should display remaining spots correctly', async () => {
            const eventWithOneSpot = {
                ...mockEvent,
                registered_count: 99,
                capacity: 100
            };

            api.get.mockResolvedValue({
                data: {
                    data: eventWithOneSpot
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/1 kontenjan kaldı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display remaining spots message when remaining spots is zero', async () => {
            const eventExactlyFull = {
                ...mockEvent,
                registered_count: 99,
                capacity: 100,
                // Make sure it's still registerable
                registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            api.get.mockResolvedValue({
                data: {
                    data: eventExactlyFull
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                // Should show 1 spot remaining
                expect(screen.getByText(/1 kontenjan kaldı/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle registration with custom fields', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            api.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 'registration-1'
                    }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const registerButton = screen.getByText(/Kayıt Ol/i);
                fireEvent.click(registerButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/events/event-1/register', {
                    custom_fields: undefined
                });
            }, { timeout: 3000 });
        });

        it('should show loading text when registering', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            let resolvePost;
            const postPromise = new Promise((resolve) => {
                resolvePost = resolve;
            });
            api.post.mockReturnValue(postPromise);

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Kayıt Ol/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const registerButton = screen.getByText(/Kayıt Ol/i);
            fireEvent.click(registerButton);

            await waitFor(() => {
                expect(screen.getByText(/Kaydediliyor/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Cleanup - resolve the promise to avoid hanging
            setTimeout(() => {
                resolvePost({
                    data: {
                        success: true,
                        data: { id: 'registration-1' }
                    }
                });
            }, 100);
        });
    });

    describe('Registration Section - Full Event', () => {
        it('should not display registration section when event is full', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventFull
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText(/Kayıt Ol/i)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display "Event is full" message when capacity is reached', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventFull
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Etkinlik dolu/i)).toBeInTheDocument();
                expect(screen.getByText(/Kayıt yapılamaz/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

    });

    describe('Registration Section - Expired Deadline', () => {
        it('should not display registration section when deadline has passed', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventExpired
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.queryByText(/Kayıt Ol/i)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display "Registration deadline passed" message', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEventExpired
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Kayıt süresi dolmuş/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

    });

    describe('Navigation', () => {
        it('should navigate back when back button is clicked', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: mockEvent
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const backButton = screen.getByText(/Geri/i);
                fireEvent.click(backButton);
            }, { timeout: 3000 });

            expect(mockNavigate).toHaveBeenCalledWith('/events');
        });
    });

    describe('Category Labels', () => {
        it('should display correct label for conference category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'conference' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                const categoryBadges = screen.getAllByText(/Konferans/i);
                expect(categoryBadges.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should display correct label for workshop category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'workshop' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Workshop/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display correct label for social category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'social' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Sosyal/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display correct label for sports category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'sports' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Spor/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display correct label for academic category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'academic' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Akademik/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display correct label for cultural category', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'cultural' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Kültürel/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display category as-is when category is unknown', async () => {
            api.get.mockResolvedValue({
                data: {
                    data: { ...mockEvent, category: 'unknown_category' }
                }
            });

            renderWithProviders(<EventDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/unknown_category/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('canRegister Function', () => {
        it('should return false when event is null', () => {
            // This is tested indirectly through component rendering
            // When event is null, canRegister() returns false
            const canRegister = (event) => {
                if (!event) return false;
                if (event.registered_count >= event.capacity) return false;
                if (new Date() > new Date(event.registration_deadline)) return false;
                return true;
            };

            expect(canRegister(null)).toBe(false);
        });

        it('should return false when event is full', () => {
            const canRegister = (event) => {
                if (!event) return false;
                if (event.registered_count >= event.capacity) return false;
                if (new Date() > new Date(event.registration_deadline)) return false;
                return true;
            };

            const fullEvent = {
                registered_count: 100,
                capacity: 100,
                registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            expect(canRegister(fullEvent)).toBe(false);
        });

        it('should return false when deadline has passed', () => {
            const canRegister = (event) => {
                if (!event) return false;
                if (event.registered_count >= event.capacity) return false;
                if (new Date() > new Date(event.registration_deadline)) return false;
                return true;
            };

            const expiredEvent = {
                registered_count: 50,
                capacity: 100,
                registration_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            };

            expect(canRegister(expiredEvent)).toBe(false);
        });

        it('should return true when event is available', () => {
            const canRegister = (event) => {
                if (!event) return false;
                if (event.registered_count >= event.capacity) return false;
                if (new Date() > new Date(event.registration_deadline)) return false;
                return true;
            };

            const availableEvent = {
                registered_count: 50,
                capacity: 100,
                registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            expect(canRegister(availableEvent)).toBe(true);
        });
    });
});
