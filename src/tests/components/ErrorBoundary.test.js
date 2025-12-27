import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('should render children when no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render error UI when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Bir hata oluştu/i)).toBeInTheDocument();
        expect(screen.getByText(/Üzgünüz, beklenmeyen bir hata meydana geldi/i)).toBeInTheDocument();
    });

    it('should have reload button', () => {
        const reload = jest.fn();
        delete window.location;
        window.location = { reload: reload };

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const button = screen.getByText(/Sayfayı Yenile/i);
        expect(button).toBeInTheDocument();

        button.click();
        expect(reload).toHaveBeenCalled();
    });
});

