// src/tests/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should return initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
        
        expect(result.current[0]).toBe('initial-value');
    });

    it('should return stored value from localStorage', () => {
        localStorage.setItem('test-key', JSON.stringify('stored-value'));
        
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
        
        expect(result.current[0]).toBe('stored-value');
    });

    it('should return parsed JSON from localStorage', () => {
        const storedObject = { name: 'Test', value: 123 };
        localStorage.setItem('test-key', JSON.stringify(storedObject));
        
        const { result } = renderHook(() => useLocalStorage('test-key', {}));
        
        expect(result.current[0]).toEqual(storedObject);
    });

    it('should update localStorage when value changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        
        act(() => {
            result.current[1]('new-value');
        });
        
        expect(result.current[0]).toBe('new-value');
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
    });

    it('should handle function updates', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 0));
        
        act(() => {
            result.current[1]((prev) => prev + 1);
        });
        
        expect(result.current[0]).toBe(1);
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify(1));
    });

    it('should handle complex object updates', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));
        
        act(() => {
            result.current[1]({ count: 5, name: 'Test' });
        });
        
        expect(result.current[0]).toEqual({ count: 5, name: 'Test' });
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify({ count: 5, name: 'Test' }));
    });

    it('should handle array updates', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', []));
        
        act(() => {
            result.current[1]([1, 2, 3]);
        });
        
        expect(result.current[0]).toEqual([1, 2, 3]);
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify([1, 2, 3]));
    });

    it('should return initial value on JSON parse error', () => {
        localStorage.setItem('test-key', 'invalid-json');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
        
        expect(result.current[0]).toBe('default');
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage setItem error gracefully', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        
        // Mock localStorage.setItem to throw error
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = jest.fn(() => {
            throw new Error('Storage quota exceeded');
        });
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        act(() => {
            result.current[1]('new-value');
        });
        
        // Value should still update in state even if localStorage fails
        expect(result.current[0]).toBe('new-value');
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        localStorage.setItem = originalSetItem;
        consoleErrorSpy.mockRestore();
    });

    it('should handle null initial value', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', null));
        
        expect(result.current[0]).toBeNull();
    });

    it('should handle undefined initial value', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', undefined));
        
        expect(result.current[0]).toBeUndefined();
    });

    it('should handle boolean values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', false));
        
        act(() => {
            result.current[1](true);
        });
        
        expect(result.current[0]).toBe(true);
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify(true));
    });

    it('should handle number values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 0));
        
        act(() => {
            result.current[1](42);
        });
        
        expect(result.current[0]).toBe(42);
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify(42));
    });
});

