// src/tests/hooks/index.test.js
import { useLocalStorage } from '../../hooks/index';

describe('Hooks Index', () => {
    it('should export useLocalStorage', () => {
        expect(useLocalStorage).toBeDefined();
        expect(typeof useLocalStorage).toBe('function');
    });
});

