// Include this for additional matchers if needed
// import '@testing-library/react-native/extend-expect';

// Mock specific native modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-secure-store');
jest.mock('expo-location');

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    FontAwesome5: 'FontAwesome5',
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    Link: 'Link',
    Redirect: () => null,
    Stack: {
        Screen: () => null,
    },
}));

// Mock Linear Gradient
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient'
}));

// Mock FlashList (it's hard to test virtualized lists, usually we mock it as a simple map)
jest.mock('@shopify/flash-list', () => ({
    FlashList: ({ data, renderItem, ListHeaderComponent, ListEmptyComponent }) => {
        const React = require('react');

        return (
            <React.Fragment>
                {ListHeaderComponent && <ListHeaderComponent />}
                {data && data.map((item, index) => (
                    <React.Fragment key={index}>
                        {renderItem({ item, index })}
                    </React.Fragment>
                ))}
                {(!data || data.length === 0) && ListEmptyComponent}
            </React.Fragment>
        );
    },
}));

// Mock SafeArea Context
jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: jest.fn(({ children }) => children),
        SafeAreaView: jest.fn(({ children }) => children),
        useSafeAreaInsets: jest.fn(() => inset),
    };
});

// Mock Assets
jest.mock('./assets/logo.png', () => 1);
