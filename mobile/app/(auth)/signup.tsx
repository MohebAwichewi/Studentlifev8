import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, Modal, FlatList, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const TUNISIAN_CITIES = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Kairouan",
    "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Gafsa", "Tozeur", "Kebili", "Gabès", "Medenine", "Tataouine"
];

export default function SignupScreen() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        city: '',
        dob: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const router = useRouter();

    const isFormValid = () => {
        return (
            form.firstName.trim() !== '' &&
            form.lastName.trim() !== '' &&
            form.city !== '' &&
            form.dob.length === 10 && // Check for DD/MM/YYYY length
            form.phone.trim() !== '' &&
            form.email.trim() !== '' &&
            form.password.length >= 6 &&
            termsAccepted
        );
    };

    const handleDateChange = (text: string) => {
        // Simple masking for DD/MM/YYYY
        let cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        if (cleaned.length > 5) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
        if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
        setForm({ ...form, dob: cleaned });
    };

    const handleSignup = async () => {
        if (!isFormValid()) {
            Alert.alert("Incomplete Form", "Please fill in all fields and accept the terms.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
            formData.append('city', form.city);
            // Defaulting university to city for back-compat if needed, or send empty if backend allows.
            // Assuming backend expects 'university' field, we'll send city there or a placeholder if required.
            // Let's send city as university for now to satisfy potential backend checks, or "Other"
            formData.append('university', 'Other');
            formData.append('dob', form.dob);
            formData.append('phone', form.phone);
            formData.append('fullName', `${form.firstName} ${form.lastName}`);

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                // @ts-ignore
                formData.append('idImage', { uri: image, name: filename, type });
            }

            const res = await api.post('/auth/user/signup', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                Alert.alert("Success", "Account created! Please verify your email.");
                router.push({ pathname: '/(auth)/otp', params: { email: form.email } });
            } else {
                Alert.alert("Signup Failed", res.data.error || "Could not create account");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.error || "Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-8 pt-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View className="mb-8 items-center">
                    <Text className="text-3xl font-black text-[#ef4444] mb-2">WIN</Text>
                    <Text className="text-2xl font-bold text-slate-900">Create Account</Text>
                    <Text className="text-slate-500 text-center mt-1">Join the community and start saving.</Text>
                </View>

                <View className="space-y-4">
                    {/* Name Fields */}
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">First Name</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                placeholder="John"
                                placeholderTextColor="#cbd5e1"
                                value={form.firstName}
                                onChangeText={t => setForm({ ...form, firstName: t })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Last Name</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                placeholder="Doe"
                                placeholderTextColor="#cbd5e1"
                                value={form.lastName}
                                onChangeText={t => setForm({ ...form, lastName: t })}
                            />
                        </View>
                    </View>

                    {/* City Selection */}
                    <View>
                        <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Home City</Text>
                        <TouchableOpacity onPress={() => setShowCityModal(true)} activeOpacity={0.7}>
                            <View pointerEvents="none">
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                    placeholder="Select City"
                                    placeholderTextColor="#cbd5e1"
                                    value={form.city}
                                    editable={false}
                                />
                                <View className="absolute right-4 top-4">
                                    <FontAwesome5 name="chevron-down" size={16} color="#94a3b8" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Contact Info */}
                    <View>
                        <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Email or Phone</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            placeholder="user@example.com"
                            placeholderTextColor="#cbd5e1"
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* DOB & Phone (Secondary) */}
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Date of Birth</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#cbd5e1"
                                value={form.dob}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                        {/* Hidden Phone field if user puts email in main input, or keep separate. 
                             Request asked for "Email or Phone" flexible input but backend likely needs both.
                             I'll keep phone specific for structure.
                          */}
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Mobile</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                placeholder="Phone No."
                                placeholderTextColor="#cbd5e1"
                                value={form.phone}
                                onChangeText={t => setForm({ ...form, phone: t })}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View>
                        <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Password</Text>
                        <View>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900 pr-12"
                                placeholder="••••••••"
                                placeholderTextColor="#cbd5e1"
                                value={form.password}
                                onChangeText={t => setForm({ ...form, password: t })}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4"
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        className="flex-row items-center mt-2"
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <View className={`w-6 h-6 border rounded mr-3 items-center justify-center ${termsAccepted ? 'bg-[#ef4444] border-[#ef4444]' : 'bg-white border-slate-300'}`}>
                            {termsAccepted && <FontAwesome5 name="check" size={12} color="white" />}
                        </View>
                        <Text className="text-slate-500 text-xs flex-1">
                            I agree to the <Text className="font-bold text-slate-900">Terms of Service</Text> & <Text className="font-bold text-slate-900">Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={!isFormValid() || loading}
                        className={`w-full py-4 rounded-xl mt-4 shadow-sm ${(!isFormValid() || loading) ? 'bg-slate-300' : 'bg-[#ef4444]'}`}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? 'Creating Account...' : 'Sign Up'}
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
                                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }} // Placeholder or use icon
                                style={{ width: 20, height: 20 }}
                            />
                            {/* Using FontAwesome Google icon if image fails or prefer consistent icons */}
                            {/* <FontAwesome5 name="google" size={18} color="#DB4437" /> */}
                            <Text className="font-bold text-slate-700">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-[#1877F2] py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-sm">
                            <FontAwesome5 name="facebook" size={18} color="white" />
                            <Text className="font-bold text-white">Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-6 pb-4">
                        <Text className="text-slate-500 font-bold">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity><Text className="text-[#ef4444] font-bold">Login</Text></TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>

            {/* City Selection Modal */}
            <Modal visible={showCityModal} animationType="slide" transparent={true} onRequestClose={() => setShowCityModal(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl h-3/4 overflow-hidden">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center bg-slate-50">
                            <Text className="text-lg font-black text-slate-900">Select City</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)} className="p-2 bg-slate-200 rounded-full">
                                <FontAwesome5 name="times" size={14} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TUNISIAN_CITIES}
                            keyExtractor={(item) => item}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="py-4 border-b border-slate-100 flex-row justify-between items-center"
                                    onPress={() => {
                                        setForm({ ...form, city: item });
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Text className={`text-lg ${form.city === item ? 'font-bold text-[#ef4444]' : 'text-slate-700'}`}>
                                        {item}
                                    </Text>
                                    {form.city === item && <FontAwesome5 name="check" size={14} color="#ef4444" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
