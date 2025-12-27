import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../../components/EmptyState';

describe('EmptyState', () => {
    it('should render with default props', () => {
        render(<EmptyState />);

        expect(screen.getByText('Veri bulunamadı')).toBeInTheDocument();
        expect(screen.getByText('Henüz burada içerik bulunmamaktadır.')).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
        render(
            <EmptyState
                title="No Data"
                message="There is no data available"
            />
        );

        expect(screen.getByText('No Data')).toBeInTheDocument();
        expect(screen.getByText('There is no data available')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
        const icon = <div data-testid="icon">Icon</div>;
        render(<EmptyState icon={icon} />);

        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render action button when actionLabel and onAction provided', () => {
        const onAction = jest.fn();
        render(
            <EmptyState
                actionLabel="Add Item"
                onAction={onAction}
            />
        );

        const button = screen.getByText('Add Item');
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should not render action button when actionLabel is missing', () => {
        const onAction = jest.fn();
        render(<EmptyState onAction={onAction} />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render action button when onAction is missing', () => {
        render(<EmptyState actionLabel="Add Item" />);

        expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
    });
});

