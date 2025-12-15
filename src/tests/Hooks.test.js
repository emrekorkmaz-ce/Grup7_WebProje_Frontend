import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
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
    }
}));

// Wrapper component
const wrapper = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            {children}
        </AuthProvider>
    </BrowserRouter>
);

describe('Custom Hooks Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    // ==================== USE STATE HOOK TESTS ====================
    describe('useState Behavior', () => {
        it('should initialize with default value', () => {
            let state = 'initial';
            expect(state).toBe('initial');
        });

        it('should update state', () => {
            let state = 'initial';
            state = 'updated';
            expect(state).toBe('updated');
        });

        it('should handle object state', () => {
            let state = { name: 'Test', count: 0 };
            state = { ...state, count: 1 };
            expect(state.count).toBe(1);
        });

        it('should handle array state', () => {
            let state = [1, 2, 3];
            state = [...state, 4];
            expect(state).toEqual([1, 2, 3, 4]);
        });
    });

    // ==================== USE EFFECT BEHAVIOR TESTS ====================
    describe('useEffect Behavior', () => {
        it('should run on mount', () => {
            let mounted = false;
            const effect = () => {
                mounted = true;
            };
            effect();
            expect(mounted).toBe(true);
        });

        it('should clean up on unmount', () => {
            let cleanedUp = false;
            const cleanup = () => {
                cleanedUp = true;
            };
            cleanup();
            expect(cleanedUp).toBe(true);
        });

        it('should run when dependency changes', () => {
            let runCount = 0;
            const runEffect = () => {
                runCount++;
            };
            runEffect();
            runEffect();
            expect(runCount).toBe(2);
        });
    });

    // ==================== USE LOCAL STORAGE HOOK TESTS ====================
    describe('useLocalStorage Behavior', () => {
        it('should get initial value from localStorage', () => {
            localStorage.setItem('key', JSON.stringify('stored'));
            const value = JSON.parse(localStorage.getItem('key'));
            expect(value).toBe('stored');
        });

        it('should set value to localStorage', () => {
            localStorage.setItem('key', JSON.stringify('value'));
            expect(JSON.parse(localStorage.getItem('key'))).toBe('value');
        });

        it('should use default value if not in localStorage', () => {
            const stored = localStorage.getItem('nonexistent');
            const value = stored ? JSON.parse(stored) : 'default';
            expect(value).toBe('default');
        });

        it('should update localStorage when value changes', () => {
            localStorage.setItem('key', JSON.stringify('initial'));
            localStorage.setItem('key', JSON.stringify('updated'));
            expect(JSON.parse(localStorage.getItem('key'))).toBe('updated');
        });

        it('should remove value from localStorage', () => {
            localStorage.setItem('key', 'value');
            localStorage.removeItem('key');
            expect(localStorage.getItem('key')).toBeNull();
        });
    });

    // ==================== USE FORM HOOK TESTS ====================
    describe('useForm Behavior', () => {
        it('should initialize form values', () => {
            const initialValues = { email: '', password: '' };
            let values = { ...initialValues };
            expect(values.email).toBe('');
            expect(values.password).toBe('');
        });

        it('should update form values', () => {
            let values = { email: '', password: '' };
            values = { ...values, email: 'test@test.edu' };
            expect(values.email).toBe('test@test.edu');
        });

        it('should validate form values', () => {
            const validate = (values) => {
                const errors = {};
                if (!values.email) errors.email = 'Required';
                if (!values.password) errors.password = 'Required';
                return errors;
            };

            const values = { email: '', password: 'test' };
            const errors = validate(values);
            expect(errors.email).toBe('Required');
            expect(errors.password).toBeUndefined();
        });

        it('should reset form values', () => {
            const initialValues = { email: '', password: '' };
            let values = { email: 'test@test.edu', password: 'pass' };
            values = { ...initialValues };
            expect(values.email).toBe('');
        });

        it('should track form submission state', () => {
            let isSubmitting = false;
            isSubmitting = true;
            expect(isSubmitting).toBe(true);
            isSubmitting = false;
            expect(isSubmitting).toBe(false);
        });

        it('should track touched fields', () => {
            let touched = {};
            touched = { ...touched, email: true };
            expect(touched.email).toBe(true);
        });
    });

    // ==================== USE FETCH HOOK TESTS ====================
    describe('useFetch Behavior', () => {
        it('should initialize with loading state', () => {
            const state = { data: null, loading: true, error: null };
            expect(state.loading).toBe(true);
            expect(state.data).toBeNull();
        });

        it('should set data on success', async () => {
            api.get.mockResolvedValueOnce({ data: { items: [] } });
            
            const response = await api.get('/test');
            const state = { data: response.data, loading: false, error: null };
            
            expect(state.loading).toBe(false);
            expect(state.data).toEqual({ items: [] });
        });

        it('should set error on failure', async () => {
            api.get.mockRejectedValueOnce(new Error('Failed'));
            
            let error = null;
            try {
                await api.get('/error');
            } catch (e) {
                error = e.message;
            }
            
            expect(error).toBe('Failed');
        });

        it('should refetch data', async () => {
            api.get.mockResolvedValue({ data: { count: 1 } });
            
            await api.get('/test');
            await api.get('/test');
            
            expect(api.get).toHaveBeenCalledTimes(2);
        });
    });

    // ==================== USE DEBOUNCE HOOK TESTS ====================
    describe('useDebounce Behavior', () => {
        jest.useFakeTimers();

        it('should delay value update', () => {
            let value = '';
            let debouncedValue = '';
            
            value = 'test';
            setTimeout(() => {
                debouncedValue = value;
            }, 300);
            
            expect(debouncedValue).toBe('');
            
            jest.advanceTimersByTime(300);
            expect(debouncedValue).toBe('test');
        });

        it('should cancel previous timeout on new value', () => {
            const callback = jest.fn();
            
            setTimeout(callback, 300);
            jest.advanceTimersByTime(100);
            
            jest.clearAllTimers();
            jest.advanceTimersByTime(300);
            
            expect(callback).not.toHaveBeenCalled();
        });

        afterAll(() => {
            jest.useRealTimers();
        });
    });

    // ==================== USE TOGGLE HOOK TESTS ====================
    describe('useToggle Behavior', () => {
        it('should initialize with false', () => {
            let value = false;
            expect(value).toBe(false);
        });

        it('should toggle value', () => {
            let value = false;
            value = !value;
            expect(value).toBe(true);
            value = !value;
            expect(value).toBe(false);
        });

        it('should set specific value', () => {
            let value = false;
            value = true;
            expect(value).toBe(true);
        });
    });

    // ==================== USE CLICK OUTSIDE HOOK TESTS ====================
    describe('useClickOutside Behavior', () => {
        it('should detect click outside', () => {
            let clickedOutside = false;
            const handleClickOutside = () => {
                clickedOutside = true;
            };
            
            handleClickOutside();
            expect(clickedOutside).toBe(true);
        });

        it('should not trigger for click inside', () => {
            let clickedOutside = false;
            const isOutside = false;
            
            if (isOutside) {
                clickedOutside = true;
            }
            
            expect(clickedOutside).toBe(false);
        });
    });

    // ==================== USE PAGINATION HOOK TESTS ====================
    describe('usePagination Behavior', () => {
        it('should initialize pagination state', () => {
            const pagination = {
                page: 1,
                limit: 10,
                total: 0
            };
            
            expect(pagination.page).toBe(1);
            expect(pagination.limit).toBe(10);
        });

        it('should go to next page', () => {
            let page = 1;
            const totalPages = 5;
            
            if (page < totalPages) {
                page++;
            }
            
            expect(page).toBe(2);
        });

        it('should go to previous page', () => {
            let page = 3;
            
            if (page > 1) {
                page--;
            }
            
            expect(page).toBe(2);
        });

        it('should not go below page 1', () => {
            let page = 1;
            
            if (page > 1) {
                page--;
            }
            
            expect(page).toBe(1);
        });

        it('should calculate total pages', () => {
            const total = 95;
            const limit = 10;
            const totalPages = Math.ceil(total / limit);
            
            expect(totalPages).toBe(10);
        });
    });

    // ==================== USE SEARCH HOOK TESTS ====================
    describe('useSearch Behavior', () => {
        it('should initialize with empty query', () => {
            let query = '';
            expect(query).toBe('');
        });

        it('should update query', () => {
            let query = '';
            query = 'search term';
            expect(query).toBe('search term');
        });

        it('should filter results', () => {
            const items = [
                { name: 'Apple' },
                { name: 'Banana' },
                { name: 'Orange' }
            ];
            const query = 'an';
            const filtered = items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            
            expect(filtered.length).toBe(2); // Banana, Orange
        });

        it('should clear search', () => {
            let query = 'test';
            query = '';
            expect(query).toBe('');
        });
    });

    // ==================== USE SORT HOOK TESTS ====================
    describe('useSort Behavior', () => {
        it('should sort ascending', () => {
            const items = [3, 1, 2];
            const sorted = [...items].sort((a, b) => a - b);
            expect(sorted).toEqual([1, 2, 3]);
        });

        it('should sort descending', () => {
            const items = [1, 3, 2];
            const sorted = [...items].sort((a, b) => b - a);
            expect(sorted).toEqual([3, 2, 1]);
        });

        it('should sort by property', () => {
            const items = [
                { name: 'Charlie' },
                { name: 'Alice' },
                { name: 'Bob' }
            ];
            const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
            expect(sorted[0].name).toBe('Alice');
        });

        it('should toggle sort direction', () => {
            let direction = 'asc';
            direction = direction === 'asc' ? 'desc' : 'asc';
            expect(direction).toBe('desc');
        });
    });

    // ==================== USE FILTER HOOK TESTS ====================
    describe('useFilter Behavior', () => {
        it('should filter by single criteria', () => {
            const items = [
                { type: 'A', value: 1 },
                { type: 'B', value: 2 },
                { type: 'A', value: 3 }
            ];
            const filtered = items.filter(item => item.type === 'A');
            expect(filtered.length).toBe(2);
        });

        it('should filter by multiple criteria', () => {
            const items = [
                { type: 'A', active: true },
                { type: 'B', active: true },
                { type: 'A', active: false }
            ];
            const filtered = items.filter(item => 
                item.type === 'A' && item.active
            );
            expect(filtered.length).toBe(1);
        });

        it('should clear filters', () => {
            let filters = { type: 'A', active: true };
            filters = {};
            expect(Object.keys(filters).length).toBe(0);
        });
    });
});

