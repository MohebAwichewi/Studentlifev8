import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signIn } = useAuth();
    const { showNotification } = useNotification();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showNotification('error', 'Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/student/login', { email, password });

            if (res.data.success) {
                const backendToken = res.data.token || res.data.accessToken || res.data.data?.token;
                if (!backendToken) {
                    showNotification('error', 'Login Error', 'Success but no token found.');
                    return;
                }
                signIn(backendToken, res.data.user || res.data.data?.user);
            } else {
                showNotification('error', 'Login Failed', res.data.error || 'Invalid credentials');
            }
        } catch (error: any) {


            showNotification('error', 'Error', error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo & Header */}
                    <View className="items-center mb-10 mt-6">
                        <View className="w-32 h-32 bg-white rounded-3xl shadow-xl shadow-slate-200 items-center justify-center mb-6 border border-slate-50">
                            <Image
                                source={require('../../assets/logo.png')}
                                className="w-24 h-24"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-4xl font-black text-slate-900 tracking-tight text-center">
                            Welcome Back
                        </Text>
                        <Text className="text-slate-400 font-medium text-center mt-2 px-4 leading-6">
                            Unlock exclusive student deals from your favorite brands.
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-5 w-full">
                        <View>
                            <View className="absolute z-10 top-[18px] left-4">
                                <FontAwesome5 name="envelope" size={16} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="w-full bg-slate-50 text-slate-900 p-4 pl-12 rounded-2xl border border-slate-200 font-bold text-base focus:border-slate-900 focus:bg-white transition-all h-14"
                                placeholder="University Email"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <View className="absolute z-10 top-[18px] left-4">
                                <FontAwesome5 name="lock" size={16} color="#94a3b8" />
                            </View>
                            <TextInput
                                className="w-full bg-slate-50 text-slate-900 p-4 pl-12 pr-12 rounded-2xl border border-slate-200 font-bold text-base focus:border-slate-900 focus:bg-white transition-all h-14"
                                placeholder="Password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[18px]"
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity className="items-end py-1">
                            <Text className="text-slate-500 font-bold text-sm">Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`w-full h-14 rounded-2xl shadow-lg shadow-blue-200 mt-4 flex-row justify-center items-center gap-2 ${loading ? 'bg-slate-300' : 'bg-slate-900'}`}
                        >
                            {loading && <ActivityIndicator color="white" />}
                            <Text className="text-white text-center font-black text-lg tracking-wide">
                                {loading ? 'LOGGING IN...' : 'LOGIN'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-12 items-center">
                        <View className="flex-row">
                            <Text className="text-slate-500 font-bold text-base">Don't have an account? </Text>
                            <Link href="/(auth)/signup" asChild>
                                <TouchableOpacity>
                                    <Text className="text-slate-900 font-black underline decoration-slate-900 text-base">Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
