import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

type User = {
    id: string;
    fullName: string;
    email: string;
    university: string;
    isVerified: boolean;
    profilePicture?: string | null;
};

type AuthType = {
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, userData: User) => void;
    signOut: () => void;
    updateUser: (userData: User) => Promise<void>;
    following: string[];
    toggleFollow: (businessName: string) => Promise<void>;
    isFollowing: (businessName: string) => boolean;
};

const AuthContext = createContext<AuthType>({
    user: null,
    isLoading: true,
    signIn: () => { },
    signOut: () => { },
    updateUser: async () => { },
    following: [],
    toggleFollow: async () => { },
    isFollowing: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [following, setFollowing] = useState<string[]>([]);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('student_token');
                const userData = await SecureStore.getItemAsync('student_user');
                const savedFollowing = await AsyncStorage.getItem('user_following');

                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
                if (savedFollowing) {
                    setFollowing(JSON.parse(savedFollowing));
                }
            } catch (e) {

            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to dashboard if authenticated
            router.replace('/(tabs)/home');
        }
    }, [user, segments, isLoading]);

    const signIn = async (token: string, userData: User) => {
        if (!token || typeof token !== 'string') {

            return;
        }
        if (!userData) {

            return;
        }

        try {
            await SecureStore.setItemAsync('student_token', token);
            await SecureStore.setItemAsync('student_user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {

        }
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('student_token');
        await SecureStore.deleteItemAsync('student_user');
        setUser(null);
        setFollowing([]);
        await AsyncStorage.removeItem('user_following');
    };

    const updateUser = async (userData: User) => {
        await SecureStore.setItemAsync('student_user', JSON.stringify(userData));
        setUser(userData);
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
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser, following, toggleFollow, isFollowing }}>
            {children}
        </AuthContext.Provider>
    );
}
