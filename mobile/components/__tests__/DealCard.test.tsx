import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DealCard from '../DealCard';

const mockDeal = {
    id: 1,
    title: 'Test Deal',
    description: 'Test Description',
    discountValue: '50% OFF',
    image: 'https://example.com/image.jpg',
    category: 'Food',
    business: {
        businessName: 'Test Business',
        logo: 'https://example.com/logo.jpg',
    },
};

describe('DealCard', () => {
    it('renders correctly', () => {
        const { getByText } = render(<DealCard deal={mockDeal} />);

        expect(getByText('Test Deal')).toBeTruthy();
        expect(getByText('Test Business')).toBeTruthy();
        expect(getByText('50% OFF')).toBeTruthy();
    });

    it('renders multi-use badge when applicable', () => {
        const multiUseDeal = { ...mockDeal, isMultiUse: true };
        const { getByText } = render(<DealCard deal={multiUseDeal} />);

        expect(getByText('MULTI-USE')).toBeTruthy();
    });

    it('shows cooldown overlay when active', () => {
        // Mock a recent redemption
        const recentRedemptionDeal = {
            ...mockDeal,
            isMultiUse: true,
            lastRedemption: new Date().toISOString(), // Just redeemed
        };

        const { getByText } = render(<DealCard deal={recentRedemptionDeal} />);

        expect(getByText('COOLDOWN')).toBeTruthy();
    });
});
