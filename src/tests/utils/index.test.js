// src/tests/utils/index.test.js
import { formatDate, formatDateTime, truncateText } from '../../utils/index';

describe('Utils Functions', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2025-01-15T10:30:00');
            const formatted = formatDate(date);
            
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
        });

        it('should return empty string for null date', () => {
            expect(formatDate(null)).toBe('');
        });

        it('should return empty string for undefined date', () => {
            expect(formatDate(undefined)).toBe('');
        });

        it('should handle date string', () => {
            const formatted = formatDate('2025-01-15');
            expect(formatted).toBeTruthy();
        });

        it('should handle ISO date string', () => {
            const formatted = formatDate('2025-01-15T10:30:00Z');
            expect(formatted).toBeTruthy();
        });

        it('should format date in Turkish locale', () => {
            const date = new Date('2025-01-15');
            const formatted = formatDate(date);
            
            // Turkish locale format should contain day/month/year
            expect(formatted).toMatch(/\d+/);
        });
    });

    describe('formatDateTime', () => {
        it('should format date and time correctly', () => {
            const date = new Date('2025-01-15T10:30:00');
            const formatted = formatDateTime(date);
            
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
        });

        it('should return empty string for null date', () => {
            expect(formatDateTime(null)).toBe('');
        });

        it('should return empty string for undefined date', () => {
            expect(formatDateTime(undefined)).toBe('');
        });

        it('should handle date string', () => {
            const formatted = formatDateTime('2025-01-15T10:30:00');
            expect(formatted).toBeTruthy();
        });

        it('should format date and time in Turkish locale', () => {
            const date = new Date('2025-01-15T10:30:00');
            const formatted = formatDateTime(date);
            
            expect(formatted).toMatch(/\d+/);
        });
    });

    describe('truncateText', () => {
        it('should truncate text longer than maxLength', () => {
            const text = 'This is a very long text that needs to be truncated';
            const truncated = truncateText(text, 20);
            
            expect(truncated.length).toBe(23); // 20 + '...'
            expect(truncateText(text, 20)).toBe('This is a very long ...');
        });

        it('should not truncate text shorter than maxLength', () => {
            const text = 'Short text';
            const truncated = truncateText(text, 20);
            
            expect(truncated).toBe('Short text');
        });

        it('should not truncate text equal to maxLength', () => {
            const text = 'Exactly twenty chars!';
            const truncated = truncateText(text, 20);
            
            expect(truncated).toBe('Exactly twenty chars!');
        });

        it('should use default maxLength of 50', () => {
            const longText = 'a'.repeat(60);
            const truncated = truncateText(longText);
            
            expect(truncated.length).toBe(53); // 50 + '...'
            expect(truncated).toBe('a'.repeat(50) + '...');
        });

        it('should return empty string for null text', () => {
            expect(truncateText(null)).toBe('');
        });

        it('should return empty string for undefined text', () => {
            expect(truncateText(undefined)).toBe('');
        });

        it('should handle empty string', () => {
            expect(truncateText('')).toBe('');
        });

        it('should handle text with special characters', () => {
            const text = 'Text with special chars: !@#$%^&*()';
            const truncated = truncateText(text, 20);
            
            expect(truncated).toBe('Text with special c...');
        });

        it('should handle text with unicode characters', () => {
            const text = 'Text with unicode: 你好世界';
            const truncated = truncateText(text, 20);
            
            expect(truncated.length).toBeLessThanOrEqual(23);
        });

        it('should handle very short maxLength', () => {
            const text = 'Hello World';
            const truncated = truncateText(text, 5);
            
            expect(truncated).toBe('Hello...');
        });

        it('should handle zero maxLength', () => {
            const text = 'Hello';
            const truncated = truncateText(text, 0);
            
            expect(truncated).toBe('...');
        });
    });
});

