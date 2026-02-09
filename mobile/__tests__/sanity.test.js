import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

const TestComponent = () => (
    <View>
        <Text>Hello Testing</Text>
    </View>
);

test('renders correctly', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello Testing')).toBeTruthy();
});
