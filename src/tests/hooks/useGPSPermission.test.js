// src/tests/hooks/useGPSPermission.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGPSPermission } from '../../hooks/useGPSPermission';

describe('useGPSPermission Hook', () => {
    const mockGeolocation = {
        getCurrentPosition: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        delete window.navigator.geolocation;
        delete window.navigator.permissions;
    });

    it('should initialize with prompt permission when geolocation is available', async () => {
        window.navigator.geolocation = mockGeolocation;
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'prompt',
                onchange: null,
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('prompt');
        });
    });

    it('should set error when geolocation is not available', async () => {
        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.error).toBe('Cihazda konum servisi yok.');
            expect(result.current.permission).toBe('denied');
        });
    });

    it('should handle permission query error', async () => {
        window.navigator.geolocation = mockGeolocation;
        window.navigator.permissions = {
            query: jest.fn().mockRejectedValue(new Error('Permission denied')),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('prompt');
        });
    });

    it('should update permission when permission state changes', async () => {
        let onChangeCallback = null;
        window.navigator.geolocation = mockGeolocation;
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'prompt',
                get onchange() {
                    return onChangeCallback;
                },
                set onchange(callback) {
                    onChangeCallback = callback;
                },
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('prompt');
        });

        act(() => {
            if (onChangeCallback) {
                onChangeCallback({ target: { state: 'granted' } });
            }
        });

        await waitFor(() => {
            expect(result.current.permission).toBe('granted');
        });
    });

    it('should request location successfully', async () => {
        const mockPosition = {
            coords: {
                latitude: 41.0082,
                longitude: 28.9784,
                accuracy: 10,
            },
        };

        window.navigator.geolocation = {
            getCurrentPosition: jest.fn((success) => {
                success(mockPosition);
            }),
        };
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'granted',
                onchange: null,
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('granted');
        });

        act(() => {
            result.current.requestLocation();
        });

        await waitFor(() => {
            expect(result.current.location).toEqual({
                lat: 41.0082,
                lng: 28.9784,
                accuracy: 10,
            });
            expect(result.current.error).toBeNull();
        });
    });

    it('should handle location request error', async () => {
        window.navigator.geolocation = {
            getCurrentPosition: jest.fn((success, error) => {
                error({ code: 1, message: 'User denied geolocation' });
            }),
        };
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'prompt',
                onchange: null,
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('prompt');
        });

        act(() => {
            result.current.requestLocation();
        });

        await waitFor(() => {
            expect(result.current.error).toBe('Konum alınamadı.');
        });
    });

    it('should handle requestLocation when geolocation is not available', async () => {
        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.error).toBe('Cihazda konum servisi yok.');
        });

        act(() => {
            result.current.requestLocation();
        });

        expect(result.current.error).toBe('Cihazda konum servisi yok.');
        expect(result.current.permission).toBe('denied');
    });

    it('should handle granted permission state', async () => {
        window.navigator.geolocation = mockGeolocation;
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'granted',
                onchange: null,
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('granted');
        });
    });

    it('should handle denied permission state', async () => {
        window.navigator.geolocation = mockGeolocation;
        window.navigator.permissions = {
            query: jest.fn().mockResolvedValue({
                state: 'denied',
                onchange: null,
            }),
        };

        const { result } = renderHook(() => useGPSPermission());

        await waitFor(() => {
            expect(result.current.permission).toBe('denied');
        });
    });
});

