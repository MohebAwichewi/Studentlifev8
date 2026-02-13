import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs for OTP inputs
    const otpInputs = useRef<Array<TextInput | null>>([]);

    // Step 1: Send OTP
    const handleSendOTP = async () => {
        if (!email) return Alert.alert("Error", "Enter your email");
        setLoading(true);
        try {
            const res = await api.post('/auth/user/forgot-password', { email });
            // API returns success even if user not found for security, or specific error
            if (res.data.success) {
                setStep(2);
                Alert.alert("OTP Sent", "Check your email for the code.");
            } else {
                Alert.alert("Error", res.data.error || "Failed to send OTP");
            }
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || "Network Error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP (Logic only, or check with server if possible)
    const handleVerifyOTP = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return Alert.alert("Error", "Enter full 6-digit code");

        // Ensure email is still present (it should be from state)
        if (!email) return Alert.alert("Error", "Email missing. Please restart.");

        // We move to step 3. The actual validation happens on reset, 
        // unless we add a specific verify endpoint.
        setStep(3);
    };

    // Step 3: Reset Password
    const handleResetPassword = async () => {
        const otpValue = otp.join('');
        if (!newPassword || !confirmPassword) return Alert.alert("Error", "Fill all fields");
        if (newPassword !== confirmPassword) return Alert.alert("Error", "Passwords do not match");
        if (newPassword.length < 8) return Alert.alert("Error", "Password must be at least 8 characters");

        setLoading(true);
        try {
            const res = await api.put('/auth/user/forgot-password', {
                email,
                otp: otpValue,
                newPassword
            });

            if (res.data.success) {
                Alert.alert("Success", "Password reset successfully!");
                router.replace('/(auth)/login');
            } else {
                Alert.alert("Error", res.data.error || "Failed to reset password");
            }
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e.response?.data?.error || "Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpInput = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>

                    {/* Back Button */}
                    <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} className="absolute top-4 left-4 z-10 w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                        <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                    </TouchableOpacity>

                    <View className="mb-8 mt-12">
                        <View className="w-16 h-16 bg-red-50 rounded-2xl items-center justify-center mb-6">
                            <FontAwesome5 name={step === 1 ? "envelope" : step === 2 ? "key" : "lock"} size={24} color="#ef4444" />
                        </View>
                        <Text className="text-3xl font-black text-slate-900 mb-2">
                            {step === 1 ? "Forgot Password?" : step === 2 ? "Enter Code" : "New Password"}
                        </Text>
                        <Text className="text-slate-500 text-base leading-6">
                            {step === 1 ? "Don't worry! It happens. Please enter the email associated with your account." :
                                step === 2 ? `We sent a code to ${email}. Enter it below to verify your identity.` :
                                    "Create a new strong password. Must be at least 8 characters."}
                        </Text>
                    </View>

                    {step === 1 && (
                        <View className="space-y-6">
                            <View>
                                <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2">Email Address</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base focus:border-[#ef4444] focus:bg-white h-14"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleSendOTP}
                                disabled={loading}
                                className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg shadow-red-100 ${loading ? 'bg-slate-300' : 'bg-[#ef4444]'}`}
                            >
                                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Send Code</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View className="space-y-6">
                            <View className="flex-row justify-between gap-2">
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => otpInputs.current[index] = ref}
                                        className={`flex-1 h-14 border-2 rounded-xl text-center text-2xl font-bold bg-slate-50 text-slate-900 ${digit ? 'border-[#ef4444] bg-white' : 'border-slate-200'
                                            } focus:border-[#ef4444] focus:bg-white`}
                                        maxLength={1}
                                        keyboardType="number-pad"
                                        value={digit}
                                        onChangeText={(text) => handleOtpInput(text, index)}
                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                    />
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={handleVerifyOTP}
                                className="w-full h-14 rounded-2xl items-center justify-center bg-[#ef4444] shadow-lg shadow-red-100"
                            >
                                <Text className="text-white font-black text-lg">Verify Code</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSendOTP()} disabled={loading}>
                                <Text className="text-center text-slate-500 font-bold">Resend Code</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 3 && (
                        <View className="space-y-6">
                            <View>
                                <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2">New Password</Text>
                                <View>
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base focus:border-[#ef4444] focus:bg-white h-14 pr-12"
                                        placeholder="Min 8 characters"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View>
                                <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2">Confirm Password</Text>
                                <View>
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base focus:border-[#ef4444] focus:bg-white h-14 pr-12"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4">
                                        <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={loading}
                                className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg shadow-red-100 ${loading ? 'bg-slate-300' : 'bg-[#ef4444]'}`}
                            >
                                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Reset Password</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
