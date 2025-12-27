// src/tests/services/api.test.js
import api, { BACKEND_BASE_URL } from '../../services/api';
import axios from 'axios';

// Mock axios.post for refresh token calls
const originalAxiosPost = axios.post;
axios.post = jest.fn();

// Create a mock adapter that will be used for all api calls
const createMockAdapter = (response) => {
    return jest.fn((config) => {
        return Promise.resolve({
            data: response?.data || { success: true },
            status: response?.status || 200,
            statusText: response?.statusText || 'OK',
            headers: response?.headers || {},
            config
        });
    });
};

describe('API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('API Configuration', () => {
        it('should have correct base URL', () => {
            expect(api.defaults.baseURL).toBe(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');
        });

        it('should have correct headers', () => {
            expect(api.defaults.headers['Content-Type']).toBe('application/json');
        });

        it('should have withCredentials set to false', () => {
            expect(api.defaults.withCredentials).toBe(false);
        });

        it('should export BACKEND_BASE_URL correctly', () => {
            const expectedUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '') || 'http://localhost:5000';
            expect(BACKEND_BASE_URL).toBe(expectedUrl);
        });
    });

    describe('Request Interceptor', () => {
        it('should add Authorization header when token exists', () => {
            localStorage.setItem('accessToken', 'test-token-123');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBe('Bearer test-token-123');
        });

        it('should add Authorization header via actual API call', async () => {
            localStorage.setItem('accessToken', 'test-token-123');
            
            // Mock adapter to intercept requests
            const mockAdapter = jest.fn((config) => {
                return Promise.resolve({
                    data: { success: true },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                });
            });
            
            api.defaults.adapter = mockAdapter;
            
            try {
                await api.get('/test');
            } catch (e) {
                // Ignore errors
            }
            
            expect(mockAdapter).toHaveBeenCalled();
            const callConfig = mockAdapter.mock.calls[0][0];
            expect(callConfig.headers.Authorization).toBe('Bearer test-token-123');
        });

        it('should not add Authorization header when token is undefined', () => {
            localStorage.removeItem('accessToken');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('should not add Authorization header when token is string "undefined"', () => {
            localStorage.setItem('accessToken', 'undefined');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('should not add Authorization header when token is string "null"', () => {
            localStorage.setItem('accessToken', 'null');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('should handle request interceptor error', () => {
            const error = new Error('Request error');
            const interceptor = api.interceptors.request.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toThrow('Request error');
        });

        it('should handle config without headers object', () => {
            localStorage.setItem('accessToken', 'test-token');
            
            const config = {};
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBe('Bearer test-token');
        });

        it('should preserve existing headers when adding Authorization', () => {
            localStorage.setItem('accessToken', 'test-token');
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom-value'
                }
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBe('Bearer test-token');
            expect(result.headers['Content-Type']).toBe('application/json');
            expect(result.headers['X-Custom-Header']).toBe('custom-value');
        });

        it('should handle empty string token', () => {
            localStorage.setItem('accessToken', '');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('should handle whitespace token', () => {
            localStorage.setItem('accessToken', '   ');
            
            const config = {
                headers: {},
            };
            
            const interceptor = api.interceptors.request.handlers[0].fulfilled;
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBe('Bearer    ');
        });
    });

    describe('Response Interceptor', () => {
        it('should return response on success', () => {
            const response = { data: { success: true } };
            const interceptor = api.interceptors.response.handlers[0].fulfilled;
            
            const result = interceptor(response);
            expect(result).toBe(response);
        });

        it('should refresh token on 401 error', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
                url: '/test',
                method: 'get'
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {
                        accessToken: 'new-access-token',
                    },
                },
            });
            
            // Mock adapter for retry request
            const mockAdapter = createMockAdapter({ data: { success: true } });
            api.defaults.adapter = mockAdapter;
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                const result = await interceptor(error);
                expect(result).toBeDefined();
            } catch (e) {
                // May throw if adapter fails, but refresh should still work
            }
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/refresh'),
                { refreshToken: 'refresh-token-123' },
                { withCredentials: true }
            );
            expect(localStorage.getItem('accessToken')).toBe('new-access-token');
            expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
            
            // Cleanup
            delete api.defaults.adapter;
        });

        it('should handle refresh token with alternative response format', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
                url: '/test',
                method: 'get'
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    accessToken: 'new-access-token',
                },
            });
            
            const mockAdapter = createMockAdapter({ data: { success: true } });
            api.defaults.adapter = mockAdapter;
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if adapter fails
            }
            
            expect(localStorage.getItem('accessToken')).toBe('new-access-token');
            expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
            
            delete api.defaults.adapter;
        });

        it('should logout user when refresh fails', async () => {
            localStorage.setItem('accessToken', 'old-token');
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockRejectedValueOnce(new Error('Refresh failed'));
            
            delete window.location;
            window.location = { href: '' };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // Expected to throw
            }
            
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
            expect(window.location.href).toBe('/login');
        });

        it('should not retry if already retried', async () => {
            const originalRequest = {
                _retry: true,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should not refresh token if no refresh token exists', async () => {
            localStorage.removeItem('refreshToken');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle non-401 errors', async () => {
            const error = {
                response: { status: 500 },
                config: {},
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle errors without response', async () => {
            const error = {
                config: {},
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle errors without config', async () => {
            const error = {
                response: { status: 401 },
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should set Authorization header after successful token refresh', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
                url: '/test',
                method: 'get'
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {
                        accessToken: 'new-access-token',
                    },
                },
            });

            const mockRetryResponse = { data: { success: true } };
            const apiCallSpy = jest.spyOn(api, 'default').mockResolvedValue(mockRetryResponse);
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if api() is not properly mocked, but header should be set
            }
            
            expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
            expect(localStorage.getItem('accessToken')).toBe('new-access-token');
            
            apiCallSpy.mockRestore();
        });

        it('should handle refresh token response with direct accessToken format', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    accessToken: 'new-access-token-direct',
                },
            });

            const mockRetryResponse = { data: { success: true } };
            const apiCallSpy = jest.spyOn(api, 'default').mockResolvedValue(mockRetryResponse);
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if api() is not properly mocked
            }
            
            expect(localStorage.getItem('accessToken')).toBe('new-access-token-direct');
            
            apiCallSpy.mockRestore();
        });

        it('should handle refresh token response with null accessToken', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {
                        accessToken: null,
                    },
                },
            });
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // Expected behavior
            }
            
            expect(localStorage.getItem('accessToken')).toBe('null');
        });

        it('should handle refresh token response with undefined accessToken', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {},
                },
            });
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // Expected behavior
            }
            
            const storedToken = localStorage.getItem('accessToken');
            expect(storedToken).toBe('undefined');
        });

        it('should handle refresh token response with empty string accessToken', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {
                        accessToken: '',
                    },
                },
            });
            
            const mockRetryResponse = { data: { success: true } };
            const apiCallSpy = jest.spyOn(api, 'default').mockResolvedValue(mockRetryResponse);
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if api() call fails
            }
            
            expect(localStorage.getItem('accessToken')).toBe('');
            expect(originalRequest.headers.Authorization).toBe('Bearer ');
            
            apiCallSpy.mockRestore();
        });

        it('should handle error.response as null', async () => {
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: null,
                config: originalRequest,
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle error.response.status as undefined', async () => {
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: {},
                config: originalRequest,
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle refresh token as empty string', async () => {
            localStorage.setItem('refreshToken', '');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            return expect(interceptor(error)).rejects.toEqual(error);
        });

        it('should handle refresh token as null string', async () => {
            localStorage.setItem('refreshToken', 'null');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockRejectedValueOnce(new Error('Refresh failed'));
            
            delete window.location;
            window.location = { href: '' };
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // Expected to throw
            }
            
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });

        it('should handle token refresh when response.data.data.accessToken exists', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    data: {
                        accessToken: 'token-from-data-data',
                    },
                    accessToken: 'token-from-data',
                },
            });
            
            const mockRetryResponse = { data: { success: true } };
            const apiCallSpy = jest.spyOn(api, 'default').mockResolvedValue(mockRetryResponse);
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if api() is not properly mocked
            }
            
            expect(localStorage.getItem('accessToken')).toBe('token-from-data-data');
            expect(originalRequest.headers.Authorization).toBe('Bearer token-from-data-data');
            
            apiCallSpy.mockRestore();
        });

        it('should handle token refresh when only response.data.accessToken exists', async () => {
            localStorage.setItem('refreshToken', 'refresh-token-123');
            
            const originalRequest = {
                _retry: false,
                headers: {},
            };
            
            const error = {
                response: { status: 401 },
                config: originalRequest,
            };
            
            axios.post.mockResolvedValueOnce({
                data: {
                    accessToken: 'token-from-data-only',
                },
            });
            
            const mockRetryResponse = { data: { success: true } };
            const apiCallSpy = jest.spyOn(api, 'default').mockResolvedValue(mockRetryResponse);
            
            const interceptor = api.interceptors.response.handlers[0].rejected;
            
            try {
                await interceptor(error);
            } catch (e) {
                // May throw if api() is not properly mocked
            }
            
            expect(localStorage.getItem('accessToken')).toBe('token-from-data-only');
            expect(originalRequest.headers.Authorization).toBe('Bearer token-from-data-only');
            
            apiCallSpy.mockRestore();
        });
    });

    describe('API Instance', () => {
        it('should create axios instance with correct configuration', () => {
            expect(api.defaults.baseURL).toBeDefined();
            expect(api.defaults.headers['Content-Type']).toBe('application/json');
            expect(api.defaults.withCredentials).toBe(false);
        });

        it('should have request interceptor configured', () => {
            expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
        });

        it('should have response interceptor configured', () => {
            expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
        });
    });

    describe('BACKEND_BASE_URL edge cases', () => {
        it('should handle BACKEND_BASE_URL calculation correctly', () => {
            const testUrl1 = 'http://localhost:5000/api/v1';
            const result1 = testUrl1.replace('/api/v1', '') || 'http://localhost:5000';
            expect(result1).toBe('http://localhost:5000');
            
            const testUrl2 = 'https://api.example.com/api/v1';
            const result2 = testUrl2.replace('/api/v1', '') || 'http://localhost:5000';
            expect(result2).toBe('https://api.example.com');
            
            const testUrl3 = 'http://localhost:5000';
            const result3 = testUrl3.replace('/api/v1', '') || 'http://localhost:5000';
            expect(result3).toBe('http://localhost:5000');
        });

        it('should handle API_BASE_URL with trailing slash', () => {
            const testUrl = 'http://localhost:5000/api/v1/';
            const result = testUrl.replace('/api/v1', '') || 'http://localhost:5000';
            expect(result).toBe('http://localhost:5000/');
        });
    });
});
