import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../(tabs)/home';

// Mock Auth Context
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: { id: 1, name: 'Test Student' },
        following: [],
        isFollowing: jest.fn(() => false),
        toggleFollow: jest.fn(),
    })),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

// Mock API
jest.mock('../../utils/api', () => ({
    get: jest.fn(),
}));

describe('HomeScreen', () => {

    it('renders loading state correctly', () => {
        const { useQuery } = require('@tanstack/react-query');
        useQuery.mockReturnValue({
            isLoading: true,
            data: null
        });

        const { toJSON } = render(<HomeScreen />);
        // Basic check to see if it doesn't crash
        expect(toJSON()).toBeTruthy();
    });

    it('renders deals when data is loaded', async () => {
        const { useQuery } = require('@tanstack/react-query');

        // Mock Deals
        const mockDeals = [{
            id: 1,
            title: 'Burger Deal',
            description: 'Tasty burger',
            discountValue: '50%',
            image: 'http://img.com',
            category: 'Food',
            business: { businessName: 'Burger King', logo: 'http://logo.com' }
        }];

        useQuery.mockImplementation((options: any) => {
            if (options.queryKey[0] === 'deals') {
                return { isLoading: false, data: mockDeals, refetch: jest.fn() };
            }
            if (options.queryKey[0] === 'redemptions') {
                return { isLoading: false, data: [], refetch: jest.fn() };
            }
            return { isLoading: false, data: [] };
        });

        const { getAllByText } = render(<HomeScreen />);

        await waitFor(() => {
            // It appears twice: once in Banner, once in List
            expect(getAllByText('Burger Deal')).toHaveLength(2);
            expect(getAllByText('Burger King').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('filters deals by search query', async () => {
        const { useQuery } = require('@tanstack/react-query');
        const mockDeals = [
            { id: 1, title: 'Burger Deal', discountValue: '50%', business: { businessName: 'A' }, category: 'Food' },
            { id: 2, title: 'Pizza Deal', discountValue: '20%', business: { businessName: 'B' }, category: 'Food' }
        ];

        useQuery.mockImplementation((options: any) => {
            if (options.queryKey[0] === 'deals') return { isLoading: false, data: mockDeals, refetch: jest.fn() };
            return { isLoading: false, data: [] };
        });

        const { getByPlaceholderText, getByText, getAllByText } = render(<HomeScreen />);

        const searchInput = getByPlaceholderText('Search deals...');
        fireEvent.changeText(searchInput, 'Pizza');

        await waitFor(() => {
            expect(getByText('Pizza Deal')).toBeTruthy(); // Unique in list (not in banner as safeDeals[0] is Burger)

            // 'Burger Deal' is still in banner (safeDeals[0]), but NOT in list. 
            // So it should appear exactly once (in banner).
            expect(getAllByText('Burger Deal')).toHaveLength(1);
        });
    });
});
