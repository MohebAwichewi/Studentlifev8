import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationsAsync';
import api from '../utils/api';

type User = {
    id: string;
    fullName: string;
    email: string;
    university: string;
    city?: string;
    phone?: string;
    dob?: string;
    isVerified: boolean;
    follows?: any[]; // Prisma relation array
};

type AuthType = {
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, userData: User) => void;
    signOut: () => void;
    following: string[];
    toggleFollow: (businessName: string) => Promise<void>;
    isFollowing: (businessName: string) => boolean;
    isGuest: boolean;
    loginAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthType>({
    user: null,
    isLoading: true,
    signIn: () => { },
    signOut: () => { },
    following: [],
    toggleFollow: async () => { },
    isFollowing: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [following, setFollowing] = useState<string[]>([]);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('user_token');
                const userData = await SecureStore.getItemAsync('user_data');
                const savedFollowing = await AsyncStorage.getItem('user_following');

                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
                if (savedFollowing) {
                    setFollowing(JSON.parse(savedFollowing));
                }

                const guestMode = await AsyncStorage.getItem('guest_mode');
                if (guestMode === 'true') {
                    setIsGuest(true);
                }
            } catch (e) {
                console.error('Failed to load session', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const checkOnboarding = async () => {
            const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
            const inAuthGroup = segments[0] === '(auth)';
            const inOnboarding = segments[0] === 'onboarding';

            if (!hasSeenOnboarding && !inOnboarding) {
                router.replace('/onboarding');
                return;
            }

            if (inOnboarding && hasSeenOnboarding) {
                router.replace('/(auth)/login');
                return;
            }

            if (!user && !isGuest && !inAuthGroup && !inOnboarding) {
                // Redirect to login if not authenticated AND not guest
                router.replace('/(auth)/login');
            } else if ((user || isGuest) && inAuthGroup) {
                // Redirect to dashboard if authenticated OR guest
                router.replace('/(tabs)/home');
            }
        };
        checkOnboarding();
    }, [user, segments, isLoading]);



    // ... inside User type
    // ... inside AuthType

    // ... inside AuthProvider
    const signIn = async (token: string, userData: User) => {
        if (!token || typeof token !== 'string') {
            console.error("Invalid token provided to signIn:", token);
            return;
        }
        if (!userData) {
            console.error("Invalid userData provided to signIn:", userData);
            return;
        }

        try {
            await SecureStore.setItemAsync('user_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            setUser(userData);

            // REGISTER PUSH TOKEN
            try {
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken && userData.id) {
                    // Using fetch here since api util might need context or cycle
                    // Adjust URL to your backend
                    // Use the api utility if possible, but raw fetch is safer for now if api depends on auth context
                    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://win-app-tau.vercel.app';
                    // Or use the one from api.ts

                    await fetch(`${API_URL}/api/auth/user/push-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: userData.id, pushToken })
                    });
                    console.log("Push token registered");
                }
            } catch (err) {
                console.error("Push registration failed", err);
            }

        } catch (error) {
            console.error("SecureStore error in signIn:", error);
        }
    };
    // ... rest of file

    const signOut = async () => {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_data');
        await AsyncStorage.removeItem('guest_mode');
        setUser(null);
        setIsGuest(false);
        setFollowing([]);
        await AsyncStorage.removeItem('user_following');
    };

    const loginAsGuest = async () => {
        await AsyncStorage.setItem('guest_mode', 'true');
        setIsGuest(true);
    };

    const toggleFollow = async (businessName: string) => {
        let newFollowing;
        if (following.includes(businessName)) {
            newFollowing = following.filter(name => name !== businessName);
        } else {
            newFollowing = [...following, businessName];
        }
        setFollowing(newFollowing);
        await AsyncStorage.setItem('user_following', JSON.stringify(newFollowing));
    };

    const isFollowing = (businessName: string) => following.includes(businessName);

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, following, toggleFollow, isFollowing, isGuest, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
}

