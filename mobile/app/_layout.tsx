import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
<<<<<<< HEAD
=======
import { FilterProvider } from '../context/FilterContext';
import { NotificationProvider } from '../context/NotificationContext';
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

const queryClient = new QueryClient();
// Configure notifications to show even when app is foregrounded
// NOTE: This causes a crash in Expo Go on Android SDK 53 if remote notifications are touched.
// To test real push notifications, you must use a Development Build.
/*
// Notifications.setNotificationHandler({ ... }); 
*/

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useState } from 'react';

<<<<<<< HEAD
// ... (keep existing imports)

import AnimatedSplash from '../components/AnimatedSplash';

import { useAuth } from '../context/AuthContext';

function InitialLayout() {
  const { isLoading, user } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
=======

// ... (keep existing imports)

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
<<<<<<< HEAD
      SplashScreen.hideAsync();

      // Minimum splash time of 2.5s
      const timer = setTimeout(() => {
        setSplashAnimationFinished(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Combined readiness check: Font loaded AND Splash time passed AND Auth check done
  const isReady = loaded && splashAnimationFinished && !isLoading;

  if (!isReady) {
    return <AnimatedSplash />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="user/history" options={{ headerShown: false }} />
      <Stack.Screen name="user/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="deal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InitialLayout />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
=======
      // Hide native splash screen immediately so our animated one takes over
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FilterProvider>
            <NotificationProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="deal/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NotificationProvider>
          </FilterProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView >
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
  );
}
