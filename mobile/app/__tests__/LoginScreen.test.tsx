import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../(auth)/login';
import { Alert } from 'react-native';
import api from '../../utils/api';

// Mock Auth Context
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        signIn: jest.fn(),
    })),
}));

// Mock API
jest.mock('../../utils/api', () => ({
    post: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        expect(getByText('Welcome Back')).toBeTruthy();
        expect(getByPlaceholderText('University Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('shows error if fields are empty', async () => {
        const { getByText } = render(<LoginScreen />);

        fireEvent.press(getByText('LOGIN'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });

    it('calls API and signIn on success', async () => {
        const mockSignIn = jest.fn();
        const { useAuth } = require('../../context/AuthContext');

        useAuth.mockReturnValue({ signIn: mockSignIn });

        (api.post as jest.Mock).mockResolvedValue({
            data: {
                success: true,
                token: 'fake-token',
                user: { id: 1, name: 'Test User' },
            },
        });

        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('University Email'), 'test@university.edu');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByText('LOGIN'));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1);
            expect(mockSignIn).toHaveBeenCalledWith('fake-token', { id: 1, name: 'Test User' });
        });
    });
});
