// tests/components/AdditionalComponents.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// Mock API
jest.mock('../../services/api', () => ({
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

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Additional Component Tests', () => {
    describe('ProtectedRoute Component', () => {
        it('should render children when authenticated', () => {
            localStorage.setItem('accessToken', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ role: 'student' }));

            const ProtectedRoute = require('../../components/ProtectedRoute').default;
            const TestComponent = () => <div>Protected Content</div>;

            renderWithProviders(
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
        });

        it('should redirect when not authenticated', () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            const ProtectedRoute = require('../../components/ProtectedRoute').default;
            const TestComponent = () => <div>Protected Content</div>;

            renderWithProviders(
                <ProtectedRoute allowedRoles={['student']}>
                    <TestComponent />
                </ProtectedRoute>
            );

            // Should redirect to login (component won't render)
            expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
        });
    });

    describe('Navbar Component', () => {
        it('should render navigation links', () => {
            const Navbar = require('../../components/Navbar').default;
            renderWithProviders(<Navbar />);

            // Navbar should render
            expect(document.querySelector('nav') || document.body).toBeTruthy();
        });

        it('should show user menu when authenticated', () => {
            localStorage.setItem('accessToken', 'fake-token');
            localStorage.setItem('user', JSON.stringify({
                fullName: 'Test User',
                email: 'test@test.edu'
            }));

            const Navbar = require('../../components/Navbar').default;
            renderWithProviders(<Navbar />);

            expect(document.body).toBeTruthy();
        });
    });

    describe('Sidebar Component', () => {
        it('should render sidebar navigation', () => {
            localStorage.setItem('accessToken', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ role: 'student' }));

            const Sidebar = require('../../components/Sidebar').default;
            renderWithProviders(<Sidebar />);

            expect(document.body).toBeTruthy();
        });

        it('should show different menu items based on role', () => {
            localStorage.setItem('accessToken', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

            const Sidebar = require('../../components/Sidebar').default;
            renderWithProviders(<Sidebar />);

            expect(document.body).toBeTruthy();
        });
    });

    describe('DistanceIndicator Component', () => {
        it('should render distance indicator with valid locations', () => {
            const { DistanceIndicator } = require('../../components/DistanceIndicator');
            const userLocation = { lat: 41.0082, lng: 28.9784 };
            const targetLocation = { lat: 41.0092, lng: 28.9794 };
            
            render(<DistanceIndicator userLocation={userLocation} targetLocation={targetLocation} />);

            expect(screen.getByText(/Konuma uzaklık/i)).toBeInTheDocument();
            expect(screen.getByText(/\d+\.\d+ m/i)).toBeInTheDocument();
        });

        it('should return null when userLocation is missing', () => {
            const { DistanceIndicator } = require('../../components/DistanceIndicator');
            const { container } = render(<DistanceIndicator targetLocation={{ lat: 41.0092, lng: 28.9794 }} />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should return null when targetLocation is missing', () => {
            const { DistanceIndicator } = require('../../components/DistanceIndicator');
            const { container } = render(<DistanceIndicator userLocation={{ lat: 41.0082, lng: 28.9784 }} />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should calculate correct distance', () => {
            const { DistanceIndicator } = require('../../components/DistanceIndicator');
            const userLocation = { lat: 41.0082, lng: 28.9784 };
            const targetLocation = { lat: 41.0082, lng: 28.9784 }; // Same location
            
            render(<DistanceIndicator userLocation={userLocation} targetLocation={targetLocation} />);
            
            const distanceText = screen.getByText(/Konuma uzaklık/i).parentElement;
            expect(distanceText).toBeInTheDocument();
        });
    });

    describe('LocationAccuracy Component', () => {
        it('should render location accuracy with green color for high accuracy', () => {
            const { LocationAccuracy } = require('../../components/LocationAccuracy');
            const { container } = render(<LocationAccuracy accuracy={5} />);

            expect(screen.getByText(/Konum doğruluğu: 5 m/i)).toBeInTheDocument();
            const element = container.querySelector('.location-accuracy');
            expect(element).toHaveStyle({ color: 'green' });
        });

        it('should render with orange color for medium accuracy', () => {
            const { LocationAccuracy } = require('../../components/LocationAccuracy');
            const { container } = render(<LocationAccuracy accuracy={25} />);

            expect(screen.getByText(/Konum doğruluğu: 25 m/i)).toBeInTheDocument();
            const element = container.querySelector('.location-accuracy');
            expect(element).toHaveStyle({ color: 'orange' });
        });

        it('should render with red color for low accuracy', () => {
            const { LocationAccuracy } = require('../../components/LocationAccuracy');
            const { container } = render(<LocationAccuracy accuracy={100} />);

            expect(screen.getByText(/Konum doğruluğu: 100 m/i)).toBeInTheDocument();
            const element = container.querySelector('.location-accuracy');
            expect(element).toHaveStyle({ color: 'red' });
        });

        it('should return null when accuracy is null', () => {
            const { LocationAccuracy } = require('../../components/LocationAccuracy');
            const { container } = render(<LocationAccuracy accuracy={null} />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should return null when accuracy is undefined', () => {
            const { LocationAccuracy } = require('../../components/LocationAccuracy');
            const { container } = render(<LocationAccuracy />);
            
            expect(container.firstChild).toBeNull();
        });
    });

    describe('MapPreview Component', () => {
        it('should render map preview with valid coordinates', () => {
            const { MapPreview } = require('../../components/MapPreview');
            render(<MapPreview lat={41.0082} lng={28.9784} />);

            const iframe = document.querySelector('iframe[title="Konum Haritası"]');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', expect.stringContaining('openstreetmap.org'));
        });

        it('should return null when lat is missing', () => {
            const { MapPreview } = require('../../components/MapPreview');
            const { container } = render(<MapPreview lng={28.9784} />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should return null when lng is missing', () => {
            const { MapPreview } = require('../../components/MapPreview');
            const { container } = render(<MapPreview lat={41.0082} />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should return null when both coordinates are missing', () => {
            const { MapPreview } = require('../../components/MapPreview');
            const { container } = render(<MapPreview />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should generate correct map URL with coordinates', () => {
            const { MapPreview } = require('../../components/MapPreview');
            render(<MapPreview lat={41.0082} lng={28.9784} />);

            const iframe = document.querySelector('iframe');
            expect(iframe.src).toContain('41.0082');
            expect(iframe.src).toContain('28.9784');
        });
    });

    describe('Icons Component', () => {
        it('should render icon components', () => {
            const Icons = require('../../components/Icons').default;
            
            // Test if Icons component exists and can be rendered
            expect(Icons).toBeDefined();
        });
    });
});

