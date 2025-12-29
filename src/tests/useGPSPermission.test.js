import { renderHook, act } from '@testing-library/react';
import { useGPSPermission } from '../hooks/useGPSPermission';

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
};

// Mock permissions API
const mockPermissionStatus = {
    state: 'prompt',
    onchange: null
};

const mockPermissions = {
    query: jest.fn()
};

describe('useGPSPermission Hook Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGeolocation.getCurrentPosition.mockClear();
        mockPermissions.query.mockClear();

        // Reset navigator
        global.navigator.geolocation = mockGeolocation;
        global.navigator.permissions = mockPermissions;
        mockPermissionStatus.state = 'prompt';
        mockPermissionStatus.onchange = null;
    });

    describe('Initial State', () => {
        it('should initialize with prompt permission when geolocation is available', async () => {
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const { result } = renderHook(() => useGPSPermission());

            expect(result.current.permission).toBe('prompt');
            expect(result.current.location).toBe(null);
            expect(result.current.error).toBe(null);
        });

        it('should set error and denied permission when geolocation is not available', () => {
            delete global.navigator.geolocation;

            const { result } = renderHook(() => useGPSPermission());

            expect(result.current.permission).toBe('denied');
            expect(result.current.error).toBe('Cihazda konum servisi yok.');
            expect(result.current.location).toBe(null);
        });

        it('should handle permission query rejection', async () => {
            mockPermissions.query.mockRejectedValue(new Error('Permission query failed'));

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.permission).toBe('prompt');
        });
    });

    describe('Permission States', () => {
        it('should set permission to granted when permission is granted', async () => {
            mockPermissionStatus.state = 'granted';
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.permission).toBe('granted');
        });

        it('should set permission to denied when permission is denied', async () => {
            mockPermissionStatus.state = 'denied';
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.permission).toBe('denied');
        });

        it('should update permission when permission state changes', async () => {
            mockPermissionStatus.state = 'prompt';
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.permission).toBe('prompt');

            // Simulate permission change
            act(() => {
                mockPermissionStatus.state = 'granted';
                if (mockPermissionStatus.onchange) {
                    mockPermissionStatus.onchange();
                }
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.permission).toBe('granted');
        });
    });

    describe('requestLocation Function', () => {
        it('should set location when geolocation succeeds', async () => {
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const mockPosition = {
                coords: {
                    latitude: 41.0082,
                    longitude: 28.9784,
                    accuracy: 10
                }
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success(mockPosition);
            });

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            act(() => {
                result.current.requestLocation();
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.location).toEqual({
                lat: 41.0082,
                lng: 28.9784,
                accuracy: 10
            });
            expect(result.current.error).toBe(null);
        });

        it('should set error when geolocation fails', async () => {
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
                error({ code: 1, message: 'User denied geolocation' });
            });

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            act(() => {
                result.current.requestLocation();
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.error).toBe('Konum alınamadı.');
            expect(result.current.location).toBe(null);
        });

        it('should set error when geolocation is not available in requestLocation', () => {
            delete global.navigator.geolocation;

            const { result } = renderHook(() => useGPSPermission());

            act(() => {
                result.current.requestLocation();
            });

            expect(result.current.error).toBe('Cihazda konum servisi yok.');
            expect(result.current.permission).toBe('denied');
        });

        it('should clear previous error on successful location request', async () => {
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            // First, fail
            mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
                error({ code: 1, message: 'Error' });
            });

            const { result } = renderHook(() => useGPSPermission());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            act(() => {
                result.current.requestLocation();
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.error).toBe('Konum alınamadı.');

            // Then succeed
            mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
                success({
                    coords: {
                        latitude: 41.0082,
                        longitude: 28.9784,
                        accuracy: 10
                    }
                });
            });

            act(() => {
                result.current.requestLocation();
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.error).toBe(null);
            expect(result.current.location).not.toBe(null);
        });
    });

    describe('Return Values', () => {
        it('should return permission, location, error, and requestLocation', () => {
            mockPermissions.query.mockResolvedValue(mockPermissionStatus);

            const { result } = renderHook(() => useGPSPermission());

            expect(result.current).toHaveProperty('permission');
            expect(result.current).toHaveProperty('location');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('requestLocation');
            expect(typeof result.current.requestLocation).toBe('function');
        });
    });
});


















