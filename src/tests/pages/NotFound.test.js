// src/tests/pages/NotFound.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
    it('should render 404 heading', () => {
        render(
            <BrowserRouter>
                <NotFound />
            </BrowserRouter>
        );
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render page not found message', () => {
        render(
            <BrowserRouter>
                <NotFound />
            </BrowserRouter>
        );
        expect(screen.getByText('Sayfa Bulunamadı')).toBeInTheDocument();
        expect(screen.getByText('Aradığınız sayfa mevcut değil.')).toBeInTheDocument();
    });

    it('should render link to dashboard', () => {
        render(
            <BrowserRouter>
                <NotFound />
            </BrowserRouter>
        );
        const link = screen.getByText('Panele Dön');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
    });
});

