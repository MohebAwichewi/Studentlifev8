import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OTPScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);
    const { signIn } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();

    const handleInput = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const verifyOTP = async () => {
        const otpValue = code.join('');
        if (otpValue.length !== 6) {
            showNotification('error', 'Error', 'Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // Real API Call
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
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
        try {
            await api.post('/auth/student/resend-otp', { email });
            showNotification('success', 'Success', 'New code sent to your email.');
        } catch (error) {
            showNotification('error', 'Error', 'Failed to resend code.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, justifyContent: 'center' }}>

                    <View className="items-center mb-10">
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
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleInput(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={verifyOTP}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl ${loading ? 'bg-slate-300' : 'bg-slate-900'}`}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={resendCode} className="mt-6">
                        <Text className="text-slate-500 text-center font-bold">
                            Didn't receive code? <Text className="text-blue-600">Resend</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
