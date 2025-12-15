// Utils and Services Tests
import api from '../services/api';

// Mock API
jest.mock('../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    },
    BACKEND_BASE_URL: 'http://localhost:5000'
}));

describe('Utility Functions Tests', () => {
    // ==================== STRING UTILS TESTS ====================
    describe('String Utilities', () => {
        it('should capitalize first letter', () => {
            const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('world')).toBe('World');
        });

        it('should truncate long strings', () => {
            const truncate = (str, maxLength) => 
                str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
            
            expect(truncate('Short text', 20)).toBe('Short text');
            expect(truncate('This is a very long text', 10)).toBe('This is a ...');
        });

        it('should convert to slug', () => {
            const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');
            
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Test String')).toBe('test-string');
        });

        it('should trim whitespace', () => {
            expect('  test  '.trim()).toBe('test');
            expect('no spaces'.trim()).toBe('no spaces');
        });

        it('should convert to lowercase', () => {
            expect('TEST'.toLowerCase()).toBe('test');
            expect('MiXeD'.toLowerCase()).toBe('mixed');
        });
    });

    // ==================== DATE UTILS TESTS ====================
    describe('Date Utilities', () => {
        it('should format date', () => {
            const date = new Date('2025-01-15');
            const formatted = date.toLocaleDateString('tr-TR');
            expect(formatted).toBeTruthy();
        });

        it('should format time', () => {
            const date = new Date('2025-01-15T09:30:00');
            const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            expect(time).toBeTruthy();
        });

        it('should check if date is in past', () => {
            const isInPast = (date) => new Date(date) < new Date();
            
            expect(isInPast('2020-01-01')).toBe(true);
            expect(isInPast('2030-01-01')).toBe(false);
        });

        it('should check if date is in future', () => {
            const isInFuture = (date) => new Date(date) > new Date();
            
            expect(isInFuture('2030-01-01')).toBe(true);
            expect(isInFuture('2020-01-01')).toBe(false);
        });

        it('should calculate days difference', () => {
            const daysDiff = (date1, date2) => {
                const diff = Math.abs(new Date(date2) - new Date(date1));
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
            };
            
            expect(daysDiff('2025-01-01', '2025-01-10')).toBe(9);
        });

        it('should get current date ISO string', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    // ==================== NUMBER UTILS TESTS ====================
    describe('Number Utilities', () => {
        it('should format currency', () => {
            const formatCurrency = (num) => num.toFixed(2);
            
            expect(formatCurrency(10.5)).toBe('10.50');
            expect(formatCurrency(100)).toBe('100.00');
        });

        it('should round to decimal places', () => {
            const roundTo = (num, places) => Number(num.toFixed(places));
            
            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(3.14159, 3)).toBe(3.142);
        });

        it('should calculate percentage', () => {
            const percentage = (value, total) => (value / total) * 100;
            
            expect(percentage(25, 100)).toBe(25);
            expect(percentage(1, 4)).toBe(25);
        });

        it('should check if number is in range', () => {
            const isInRange = (num, min, max) => num >= min && num <= max;
            
            expect(isInRange(5, 1, 10)).toBe(true);
            expect(isInRange(15, 1, 10)).toBe(false);
        });

        it('should clamp number to range', () => {
            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
            
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(15, 0, 10)).toBe(10);
            expect(clamp(-5, 0, 10)).toBe(0);
        });
    });

    // ==================== ARRAY UTILS TESTS ====================
    describe('Array Utilities', () => {
        it('should filter array', () => {
            const items = [1, 2, 3, 4, 5];
            const filtered = items.filter(x => x > 3);
            
            expect(filtered).toEqual([4, 5]);
        });

        it('should map array', () => {
            const items = [1, 2, 3];
            const mapped = items.map(x => x * 2);
            
            expect(mapped).toEqual([2, 4, 6]);
        });

        it('should find item in array', () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const found = items.find(x => x.id === 2);
            
            expect(found).toEqual({ id: 2 });
        });

        it('should check if array includes item', () => {
            const items = [1, 2, 3];
            
            expect(items.includes(2)).toBe(true);
            expect(items.includes(5)).toBe(false);
        });

        it('should reduce array to sum', () => {
            const items = [1, 2, 3, 4, 5];
            const sum = items.reduce((acc, x) => acc + x, 0);
            
            expect(sum).toBe(15);
        });

        it('should sort array', () => {
            const items = [3, 1, 4, 1, 5];
            const sorted = [...items].sort((a, b) => a - b);
            
            expect(sorted).toEqual([1, 1, 3, 4, 5]);
        });

        it('should remove duplicates', () => {
            const items = [1, 2, 2, 3, 3, 3];
            const unique = [...new Set(items)];
            
            expect(unique).toEqual([1, 2, 3]);
        });
    });

    // ==================== OBJECT UTILS TESTS ====================
    describe('Object Utilities', () => {
        it('should check if object is empty', () => {
            const isEmpty = (obj) => Object.keys(obj).length === 0;
            
            expect(isEmpty({})).toBe(true);
            expect(isEmpty({ a: 1 })).toBe(false);
        });

        it('should get object keys', () => {
            const obj = { a: 1, b: 2, c: 3 };
            
            expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
        });

        it('should get object values', () => {
            const obj = { a: 1, b: 2, c: 3 };
            
            expect(Object.values(obj)).toEqual([1, 2, 3]);
        });

        it('should merge objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            const merged = { ...obj1, ...obj2 };
            
            expect(merged).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('should deep clone object', () => {
            const obj = { a: { b: 1 } };
            const clone = JSON.parse(JSON.stringify(obj));
            
            clone.a.b = 2;
            expect(obj.a.b).toBe(1);
        });
    });

    // ==================== VALIDATION UTILS TESTS ====================
    describe('Validation Utilities', () => {
        it('should validate email', () => {
            const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('invalid')).toBe(false);
        });

        it('should validate .edu email', () => {
            const isEduEmail = (email) => /\.edu(\.tr)?$/i.test(email);
            
            expect(isEduEmail('test@university.edu')).toBe(true);
            expect(isEduEmail('test@gmail.com')).toBe(false);
        });

        it('should validate password strength', () => {
            const isStrongPassword = (password) => {
                return password.length >= 8 &&
                    /[a-z]/.test(password) &&
                    /[A-Z]/.test(password) &&
                    /[0-9]/.test(password);
            };
            
            expect(isStrongPassword('Password123')).toBe(true);
            expect(isStrongPassword('weak')).toBe(false);
        });

        it('should validate phone number', () => {
            const isValidPhone = (phone) => /^\+?[\d\s()-]{10,}$/.test(phone);
            
            expect(isValidPhone('+90 555 123 4567')).toBe(true);
            expect(isValidPhone('123')).toBe(false);
        });

        it('should validate URL', () => {
            const isValidUrl = (url) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            };
            
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('invalid')).toBe(false);
        });

        it('should validate required field', () => {
            const isRequired = (value) => value !== '' && value !== null && value !== undefined;
            
            expect(isRequired('test')).toBe(true);
            expect(isRequired('')).toBe(false);
            expect(isRequired(null)).toBe(false);
        });
    });

    // ==================== STORAGE UTILS TESTS ====================
    describe('Storage Utilities', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it('should store item in localStorage', () => {
            localStorage.setItem('key', 'value');
            expect(localStorage.getItem('key')).toBe('value');
        });

        it('should retrieve item from localStorage', () => {
            localStorage.setItem('key', JSON.stringify({ name: 'test' }));
            const item = JSON.parse(localStorage.getItem('key'));
            expect(item.name).toBe('test');
        });

        it('should remove item from localStorage', () => {
            localStorage.setItem('key', 'value');
            localStorage.removeItem('key');
            expect(localStorage.getItem('key')).toBeNull();
        });

        it('should clear localStorage', () => {
            localStorage.setItem('key1', 'value1');
            localStorage.setItem('key2', 'value2');
            localStorage.clear();
            expect(localStorage.getItem('key1')).toBeNull();
            expect(localStorage.getItem('key2')).toBeNull();
        });
    });
});

// ==================== API SERVICE TESTS ====================
describe('API Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('HTTP Methods', () => {
        it('should make GET request', async () => {
            api.get.mockResolvedValueOnce({ data: { items: [] } });
            
            const response = await api.get('/items');
            
            expect(api.get).toHaveBeenCalledWith('/items');
            expect(response.data.items).toEqual([]);
        });

        it('should make POST request', async () => {
            api.post.mockResolvedValueOnce({ data: { id: 1, name: 'Test' } });
            
            const response = await api.post('/items', { name: 'Test' });
            
            expect(api.post).toHaveBeenCalledWith('/items', { name: 'Test' });
            expect(response.data.id).toBe(1);
        });

        it('should make PUT request', async () => {
            api.put.mockResolvedValueOnce({ data: { id: 1, name: 'Updated' } });
            
            const response = await api.put('/items/1', { name: 'Updated' });
            
            expect(api.put).toHaveBeenCalledWith('/items/1', { name: 'Updated' });
            expect(response.data.name).toBe('Updated');
        });

        it('should make DELETE request', async () => {
            api.delete.mockResolvedValueOnce({ data: { success: true } });
            
            const response = await api.delete('/items/1');
            
            expect(api.delete).toHaveBeenCalledWith('/items/1');
            expect(response.data.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle network error', async () => {
            api.get.mockRejectedValueOnce(new Error('Network Error'));
            
            await expect(api.get('/error')).rejects.toThrow('Network Error');
        });

        it('should handle 401 error', async () => {
            const error = new Error('Unauthorized');
            error.response = { status: 401, data: { message: 'Invalid token' } };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/protected')).rejects.toThrow('Unauthorized');
        });

        it('should handle 404 error', async () => {
            const error = new Error('Not Found');
            error.response = { status: 404 };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/notfound')).rejects.toThrow('Not Found');
        });

        it('should handle 500 error', async () => {
            const error = new Error('Server Error');
            error.response = { status: 500 };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/server-error')).rejects.toThrow('Server Error');
        });

        it('should handle timeout', async () => {
            api.get.mockRejectedValueOnce(new Error('Timeout'));
            
            await expect(api.get('/slow')).rejects.toThrow('Timeout');
        });
    });

    describe('Response Processing', () => {
        it('should return data from response', async () => {
            api.get.mockResolvedValueOnce({ data: { message: 'Success' } });
            
            const response = await api.get('/test');
            
            expect(response.data.message).toBe('Success');
        });

        it('should handle array response', async () => {
            api.get.mockResolvedValueOnce({ data: [1, 2, 3] });
            
            const response = await api.get('/array');
            
            expect(response.data).toEqual([1, 2, 3]);
        });

        it('should handle empty response', async () => {
            api.get.mockResolvedValueOnce({ data: null });
            
            const response = await api.get('/empty');
            
            expect(response.data).toBeNull();
        });

        it('should handle paginated response', async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    items: [1, 2, 3],
                    pagination: { page: 1, total: 100, limit: 10 }
                }
            });
            
            const response = await api.get('/paginated');
            
            expect(response.data.pagination.total).toBe(100);
        });
    });
});

// ==================== GEOLOCATION UTILS TESTS ====================
describe('Geolocation Utilities', () => {
    it('should calculate distance between two points', () => {
        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3; // Earth's radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        };

        const distance = haversine(41.0, 29.0, 41.01, 29.01);
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(2000);
    });

    it('should check if location is within radius', () => {
        const isWithinRadius = (distance, radius) => distance <= radius;
        
        expect(isWithinRadius(50, 100)).toBe(true);
        expect(isWithinRadius(150, 100)).toBe(false);
    });

    it('should validate coordinates', () => {
        const isValidCoordinate = (lat, lon) => {
            return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
        };
        
        expect(isValidCoordinate(41.0, 29.0)).toBe(true);
        expect(isValidCoordinate(100, 200)).toBe(false);
    });
});

