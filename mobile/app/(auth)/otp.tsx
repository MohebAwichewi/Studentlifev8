import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OTPScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
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

    const handleInput = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

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
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const verifyOTP = async () => {
        const otpValue = code.join('');
        if (otpValue.length !== 6) {
            Alert.alert('Error', 'Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // Real API Call
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
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, justifyContent: 'center' }}>

                    <View className="items-center mb-10">
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
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleInput(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

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
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={resendCode}
                        disabled={!canResend}
                        className="mt-6"
                    >
                        <Text className={`text-center font-bold ${!canResend ? 'text-slate-300' : 'text-slate-500'}`}>
                            Didn't receive code? <Text className={!canResend ? 'text-slate-300' : 'text-[#ef4444]'}>Resend</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
