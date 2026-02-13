<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
=======
import React, { useState, useRef } from 'react';
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
=======
import { useNotification } from '../../context/NotificationContext';
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OTPScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
<<<<<<< HEAD
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);
    const { signIn } = useAuth();
    const router = useRouter();

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Auto-focus first input on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            inputs.current[0]?.focus();
        }, 100);
        return () => clearTimeout(timeout);
    }, []);

=======
    const inputs = useRef<Array<TextInput | null>>([]);
    const { signIn } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    const handleInput = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

<<<<<<< HEAD
        // Auto-tab forward
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit if last digit filled? Optional, but good UX.
        if (index === 5 && text) {
            // We can trigger verifyOTP() here if we want, but user might want to review.
            // keeping manual button press for safety/review.
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Auto-tab backward
=======
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const verifyOTP = async () => {
        const otpValue = code.join('');
        if (otpValue.length !== 6) {
<<<<<<< HEAD
            Alert.alert('Error', 'Please enter the full 6-digit code');
=======
            showNotification('error', 'Error', 'Please enter the full 6-digit code');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            return;
        }

        setLoading(true);
        try {
            // Real API Call
<<<<<<< HEAD
            const res = await api.post('/auth/user/verify-otp', { email, otp: otpValue });

            if (res.data.success) {
                const backendToken = res.data.token || res.data.accessToken;
                if (backendToken) {
                    signIn(backendToken, res.data.user);
                } else {
                    Alert.alert('Error', 'No token received from server');
                }
            } else {
                Alert.alert('Verification Failed', res.data.error || 'Invalid Code');
                // Shake animation could go here
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Verification failed. Please check your connection.';
            Alert.alert('Error', errorMsg);
=======
            const res = await api.post('/auth/student/verify', { email, code: otpValue });

            if (res.data.success) {
                // Assuming the verify endpoint returns a token if it logs them in directly, 
                // OR we might need to login after verification. 
                // Looking at the route.ts, it returns { success: true, studentName }.
                // It does NOT return a token. So we likely need to auto-login or redirect to login.
                // However, the previous mock code assumed a token. 
                // Let's check if we can get a token or if we should just redirect to login.

                showNotification('success', "Success", "Account verified! Please log in.");
                router.replace('/(auth)/login');

            } else {
                showNotification('error', 'Verification Failed', res.data.error || 'Invalid Code');
            }
        } catch (error: any) {

            showNotification('error', 'Error', error.response?.data?.error || 'Verification failed');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
<<<<<<< HEAD
        if (!canResend) return;

        setLoading(true); // Short loading indicator
        try {
            await api.post('/auth/user/resend-otp', { email });
            Alert.alert('Success', 'New code sent to your email.');
            setTimer(59);
            setCanResend(false);
            setCode(['', '', '', '', '', '']); // Optional: Clear code on resend
            inputs.current[0]?.focus();
        } catch (error) {
            Alert.alert('Error', 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

=======
        try {
            await api.post('/auth/student/resend-otp', { email });
            showNotification('success', 'Success', 'New code sent to your email.');
        } catch (error) {
            showNotification('error', 'Error', 'Failed to resend code.');
        }
    };

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, justifyContent: 'center' }}>

                    <View className="items-center mb-10">
<<<<<<< HEAD
                        <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
                            <FontAwesome5 name="envelope-open-text" size={32} color="#ef4444" />
                        </View>
                        <Text className="text-3xl font-black text-slate-900 text-center">Check your email</Text>
                        <Text className="text-slate-500 text-center mt-2 px-4">
                            We've sent a code to <Text className="font-bold text-slate-900">{email}</Text>
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-8 gap-2">
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => inputs.current[index] = ref}
                                className={`flex-1 h-14 border-2 rounded-xl text-center text-2xl font-bold bg-slate-50 text-slate-900 ${code[index] ? 'border-[#ef4444] bg-white' : 'border-slate-200'
                                    } focus:border-[#ef4444] focus:bg-white`}
=======
                        <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
                            <FontAwesome5 name="envelope-open-text" size={32} color="#2563eb" />
                        </View>
                        <Text className="text-3xl font-black text-slate-900 text-center">Check your email</Text>
                        <Text className="text-slate-500 text-center mt-2">
                            We accepted your application! Enter the code sent to <Text className="font-bold text-slate-900">{email}</Text>
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-8">
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputs.current[index] = ref }}
                                className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-2xl font-bold bg-slate-50 focus:border-blue-500 focus:bg-white text-slate-900"
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleInput(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
<<<<<<< HEAD
                                selectTextOnFocus
=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                            />
                        ))}
                    </View>

<<<<<<< HEAD
                    {/* Timer Display */}
                    <View className="items-center mb-6">
                        <Text className="text-slate-400 font-bold text-lg font-mono">
                            {formatTimer(timer)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={verifyOTP}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl shadow-sm ${loading ? 'bg-slate-300' : 'bg-[#ef4444]'}`}
=======
                    <TouchableOpacity
                        onPress={verifyOTP}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl ${loading ? 'bg-slate-300' : 'bg-slate-900'}`}
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

<<<<<<< HEAD
                    <TouchableOpacity
                        onPress={resendCode}
                        disabled={!canResend}
                        className="mt-6"
                    >
                        <Text className={`text-center font-bold ${!canResend ? 'text-slate-300' : 'text-slate-500'}`}>
                            Didn't receive code? <Text className={!canResend ? 'text-slate-300' : 'text-[#ef4444]'}>Resend</Text>
=======
                    <TouchableOpacity onPress={resendCode} className="mt-6">
                        <Text className="text-slate-500 text-center font-bold">
                            Didn't receive code? <Text className="text-blue-600">Resend</Text>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
