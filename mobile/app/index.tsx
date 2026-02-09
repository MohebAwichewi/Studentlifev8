import { Redirect } from 'expo-router';

export default function Index() {
    // In a real app, check async storage for "hasSeenOnboarding"
    // For now, redirect to Onboarding to show the new feature
    return <Redirect href="/(auth)/login" />;
}
