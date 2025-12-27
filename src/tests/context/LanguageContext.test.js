import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../../context/LanguageContext';

const TestComponent = () => {
    const { language, toggleLanguage, setLanguage } = useLanguage();
    return (
        <div>
            <div data-testid="language">{language}</div>
            <button onClick={toggleLanguage}>Toggle</button>
            <button onClick={() => setLanguage('en')}>Set EN</button>
            <button onClick={() => setLanguage('tr')}>Set TR</button>
        </div>
    );
};

describe('LanguageContext', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('lang');
    });

    it('should provide default language as tr', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        expect(screen.getByTestId('language')).toHaveTextContent('tr');
    });

    it('should load language from localStorage', () => {
        localStorage.setItem('language', 'en');

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        expect(screen.getByTestId('language')).toHaveTextContent('en');
    });

    it('should toggle language', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        expect(screen.getByTestId('language')).toHaveTextContent('tr');

        fireEvent.click(screen.getByText('Toggle'));

        expect(screen.getByTestId('language')).toHaveTextContent('en');
        expect(localStorage.getItem('language')).toBe('en');
    });

    it('should set language', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        fireEvent.click(screen.getByText('Set EN'));

        expect(screen.getByTestId('language')).toHaveTextContent('en');
        expect(localStorage.getItem('language')).toBe('en');
    });

    it('should update document lang attribute', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        fireEvent.click(screen.getByText('Set EN'));

        expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('should throw error when used outside provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useLanguage must be used within a LanguageProvider');

        consoleError.mockRestore();
    });
});

