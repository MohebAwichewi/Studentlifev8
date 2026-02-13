import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
=======
import { useNotification } from '../../context/NotificationContext';
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
import api from '../../utils/api';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
<<<<<<< HEAD
    const { signIn, loginAsGuest } = useAuth();
=======
    const { signIn } = useAuth();
    const { showNotification } = useNotification();
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
<<<<<<< HEAD
            Alert.alert('Error', 'Please fill in all fields');
=======
            showNotification('error', 'Error', 'Please fill in all fields');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            return;
        }

        setLoading(true);
        try {
<<<<<<< HEAD
            const res = await api.post('/auth/user/login', { email, password });
=======
            const res = await api.post('/auth/student/login', { email, password });
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

            if (res.data.success) {
                const backendToken = res.data.token || res.data.accessToken || res.data.data?.token;
                if (!backendToken) {
<<<<<<< HEAD
                    Alert.alert('Login Error', 'Success but no token found.');
=======
                    showNotification('error', 'Login Error', 'Success but no token found.');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                    return;
                }
                signIn(backendToken, res.data.user || res.data.data?.user);
            } else {
<<<<<<< HEAD
                Alert.alert('Login Failed', res.data.error || 'Invalid credentials');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
=======
                showNotification('error', 'Login Failed', res.data.error || 'Invalid credentials');
            }
        } catch (error: any) {


            showNotification('error', 'Error', error.response?.data?.error || 'Something went wrong');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    const handleGuestLogin = async () => {
        await loginAsGuest();
    };

=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
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
<<<<<<< HEAD
                                source={require('../../assets/images/icon.png')}
=======
                                source={require('../../assets/logo.png')}
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                                className="w-24 h-24"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-4xl font-black text-slate-900 tracking-tight text-center">
                            Welcome Back
                        </Text>
                        <Text className="text-slate-400 font-medium text-center mt-2 px-4 leading-6">
<<<<<<< HEAD
                            Unlock exclusive user deals from your favorite brands.
=======
                            Unlock exclusive student deals from your favorite brands.
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
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
<<<<<<< HEAD
                                placeholder="Email or Phone"
=======
                                placeholder="University Email"
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
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
<<<<<<< HEAD
                            className={`w-full h-14 rounded-2xl shadow-lg shadow-blue-200 mt-2 flex-row justify-center items-center gap-2 ${loading ? 'bg-slate-300' : 'bg-[#ef4444]'}`}
=======
                            className={`w-full h-14 rounded-2xl shadow-lg shadow-blue-200 mt-4 flex-row justify-center items-center gap-2 ${loading ? 'bg-slate-300' : 'bg-slate-900'}`}
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        >
                            {loading && <ActivityIndicator color="white" />}
                            <Text className="text-white text-center font-black text-lg tracking-wide">
                                {loading ? 'LOGGING IN...' : 'LOGIN'}
                            </Text>
                        </TouchableOpacity>
                    </View>

<<<<<<< HEAD
                    {/* Guest Login */}
                    <TouchableOpacity
                        onPress={handleGuestLogin}
                        className="mt-6 border border-slate-200 py-3 rounded-xl"
                    >
                        <Text className="text-center font-bold text-slate-600">
                            Continue as Guest
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-[1px] bg-slate-200" />
                        <Text className="mx-4 text-slate-400 font-bold text-xs uppercase">Or continue with</Text>
                        <View className="flex-1 h-[1px] bg-slate-200" />
                    </View>

                    {/* Social Auth */}
                    <View className="flex-row gap-4">
                        <TouchableOpacity className="flex-1 bg-white border border-slate-200 py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-sm">
                            <Image
                                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }}
                                style={{ width: 20, height: 20 }}
                            />
                            <Text className="font-bold text-slate-700">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-[#1877F2] py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-sm">
                            <FontAwesome5 name="facebook" size={18} color="white" />
                            <Text className="font-bold text-white">Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-8 items-center">
=======
                    {/* Footer */}
                    <View className="mt-12 items-center">
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        <View className="flex-row">
                            <Text className="text-slate-500 font-bold text-base">Don't have an account? </Text>
                            <Link href="/(auth)/signup" asChild>
                                <TouchableOpacity>
<<<<<<< HEAD
                                    <Text className="text-[#ef4444] font-black underline decoration-[#ef4444] text-base">Sign Up</Text>
=======
                                    <Text className="text-slate-900 font-black underline decoration-slate-900 text-base">Sign Up</Text>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
<<<<<<< HEAD

=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
