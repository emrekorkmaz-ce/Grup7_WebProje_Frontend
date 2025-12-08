import axios from 'axios';

describe('API Service', () => {
  let api;
  let mockAxios;
  let mockInstance;
  let requestInterceptor;
  let responseInterceptor;
  let errorInterceptor;

  beforeEach(() => {
    jest.resetModules();
    
    // Create a mock axios instance that is a function
    mockInstance = jest.fn(() => Promise.resolve({ data: 'retry-success' }));
    mockInstance.interceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    };
    mockInstance.get = jest.fn();
    mockInstance.post = jest.fn();
    mockInstance.defaults = { headers: { common: {} } };

    // Mock axios.create to return our mock instance
    mockAxios = {
      create: jest.fn(() => mockInstance),
      post: jest.fn() // For the refresh token call which uses axios.post directly
    };

    jest.doMock('axios', () => mockAxios);

    // Import api.js
    api = require('./api').default;

    // Capture interceptors
    if (mockInstance.interceptors.request.use.mock.calls.length > 0) {
        requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
    }
    if (mockInstance.interceptors.response.use.mock.calls.length > 0) {
        responseInterceptor = mockInstance.interceptors.response.use.mock.calls[0][0];
        errorInterceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete window.location;
    window.location = { href: '' };
  });

  test('creates axios instance with correct config', () => {
    expect(mockAxios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: expect.any(String),
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    }));
  });

  test('request interceptor adds token if available', () => {
    localStorage.setItem('accessToken', 'test-token');
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  test('request interceptor does not add token if not available', () => {
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  test('response interceptor handles success', () => {
    const response = { data: 'success' };
    expect(responseInterceptor(response)).toBe(response);
  });

  test('response interceptor handles 401 and refreshes token', async () => {
    const originalRequest = { 
      headers: {},
      _retry: false 
    };
    
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    
    // Mock axios.post for refresh token
    mockAxios.post.mockResolvedValue({ data: { accessToken: 'new-access-token' } });
    
    await errorInterceptor(error);

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      { refreshToken: 'refresh-token' },
      { withCredentials: true }
    );
    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
    expect(mockInstance).toHaveBeenCalledWith(originalRequest);
  });

  test('response interceptor handles refresh failure', async () => {
    const originalRequest = { 
      headers: {},
      _retry: false 
    };
    
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    mockAxios.post.mockRejectedValue(new Error('Refresh failed'));

    try {
      await errorInterceptor(error);
    } catch (e) {
      expect(e.message).toBe('Refresh failed');
    }

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
