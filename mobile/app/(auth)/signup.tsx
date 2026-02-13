<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';

const UK_UNIVERSITIES = [
    // Bath universities at the top (custom priority)
    "University of Bath",
    "Bath Spa University",

    // Rest of UK universities (alphabetical)
    "Aberystwyth University",
    "Anglia Ruskin University",
    "Aston University",
    "Bangor University",
    "University of Birmingham",
    "Birmingham City University",
    "Bournemouth University",
    "University of Bradford",
    "University of Brighton",
    "University of Bristol",
    "Brunel University London",
    "University of Cambridge",
    "Canterbury Christ Church University",
    "Cardiff University",
    "Cardiff Metropolitan University",
    "City, University of London",
    "Coventry University",
    "De Montfort University",
    "University of Derby",
    "University of Dundee",
    "Durham University",
    "University of East Anglia",
    "University of East London",
    "Edge Hill University",
    "University of Edinburgh",
    "Edinburgh Napier University",
    "University of Essex",
    "University of Exeter",
    "Falmouth University",
    "University of Glasgow",
    "Glasgow Caledonian University",
    "University of Gloucestershire",
    "Goldsmiths, University of London",
    "University of Greenwich",
    "Heriot-Watt University",
    "University of Hertfordshire",
    "University of Huddersfield",
    "University of Hull",
    "Imperial College London",
    "Keele University",
    "University of Kent",
    "King's College London",
    "Kingston University",
    "Lancaster University",
    "University of Leeds",
    "Leeds Beckett University",
    "Leeds Arts University",
    "University of Leicester",
    "University of Lincoln",
    "University of Liverpool",
    "Liverpool Hope University",
    "Liverpool John Moores University",
    "University of London",
    "London Metropolitan University",
    "London South Bank University",
    "Loughborough University",
    "University of Manchester",
    "Manchester Metropolitan University",
    "Middlesex University",
    "Newcastle University",
    "Northumbria University",
    "University of Nottingham",
    "Nottingham Trent University",
    "University of Oxford",
    "Oxford Brookes University",
    "Plymouth University",
    "University of Portsmouth",
    "Queen Mary University of London",
    "Queen's University Belfast",
    "University of Reading",
    "Robert Gordon University",
    "Royal Holloway, University of London",
    "University of Salford",
    "University of Sheffield",
    "Sheffield Hallam University",
    "SOAS University of London",
    "Solent University",
    "University of Southampton",
    "Southampton Solent University",
    "University of St Andrews",
    "Staffordshire University",
    "University of Stirling",
    "University of Strathclyde",
    "University of Sunderland",
    "University of Surrey",
    "University of Sussex",
    "Swansea University",
    "Teesside University",
    "UCL (University College London)",
    "Ulster University",
    "University of Wales",
    "University of Warwick",
    "University of West London",
    "University of Westminster",
    "University of Winchester",
    "University of Wolverhampton",
    "University of Worcester",
    "University of York",
    "York St John University",
    "Other"
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
];

export default function SignupScreen() {
    const [form, setForm] = useState({
<<<<<<< HEAD
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
=======
        email: '', password: '', firstName: '', lastName: '', university: ''
    });
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showUniModal, setShowUniModal] = useState(false);
    const router = useRouter();
    const { showNotification } = useNotification();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        if (!form.email || !form.password || !form.firstName || !form.lastName || !form.university) {
            showNotification('error', "Missing Fields", "Please fill in all required fields.");
            return;
        }

        // ✅ Validation: University Email OR ID Card
        // If user has NO ID Card, they MUST use a university email.
        // If user HAS ID Card, they can use any email (gmail, etc.)
        const isUniEmail = form.email.endsWith('.ac.uk') || form.email.endsWith('.edu') || form.email.endsWith('.tn') || form.email.endsWith('rnu.tn');

        if (!image && !isUniEmail) {
            showNotification('error', "Verification Required", "Access Denied. You must use a valid university email (.ac.uk, .edu, .tn) or upload your Student ID.");
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
<<<<<<< HEAD
            formData.append('city', form.city);
            // Defaulting university to city for back-compat if needed, or send empty if backend allows.
            // Assuming backend expects 'university' field, we'll send city there or a placeholder if required.
            // Let's send city as university for now to satisfy potential backend checks, or "Other"
            formData.append('university', 'Other');
            formData.append('dob', form.dob);
            formData.append('phone', form.phone);
=======
            formData.append('university', form.university);
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            formData.append('fullName', `${form.firstName} ${form.lastName}`);

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
<<<<<<< HEAD
=======

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                // @ts-ignore
                formData.append('idImage', { uri: image, name: filename, type });
            }

<<<<<<< HEAD
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
=======
            const res = await api.post('/auth/student/signup', formData, {
                headers: {
                    'Accept': 'application/json',
                },
                transformRequest: (data, headers) => {
                    return data; // Prevent Axios from stringifying FormData
                },
            });

            if (res.data.success) {
                showNotification('success', "Success", "Account created! Please verify your email.");
                // Navigate to OTP Screen
                router.push({ pathname: '/(auth)/otp', params: { email: form.email } });
            } else {
                showNotification('error', "Signup Failed", res.data.error || "Could not create account");
            }
        } catch (error: any) {

            showNotification('error', "Error", error.response?.data?.error || "Network Error");
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
<<<<<<< HEAD
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
=======
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView className="px-8 pt-8" contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-slate-900">Create Account</Text>
                        <Text className="text-slate-500 mt-2">Join the student community.</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">First Name</Text>
                                <TextInput className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" placeholder="John" value={form.firstName} onChangeText={t => setForm({ ...form, firstName: t })} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Last Name</Text>
                                <TextInput className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" placeholder="Doe" value={form.lastName} onChangeText={t => setForm({ ...form, lastName: t })} />
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">University</Text>
                            <TouchableOpacity onPress={() => setShowUniModal(true)}>
                                <View pointerEvents="none">
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                                        placeholder="Select University"
                                        value={form.university}
                                        editable={false}
                                    />
                                    <View className="absolute right-4 top-4">
                                        <FontAwesome5 name="chevron-down" size={16} color="#94a3b8" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Email</Text>
                            <TextInput className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" placeholder="student@university.ac.uk" value={form.email} onChangeText={t => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Password</Text>
                            <TextInput className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" placeholder="••••••••" value={form.password} onChangeText={t => setForm({ ...form, password: t })} secureTextEntry />
                        </View>

                        {/* ID Upload */}
                        <TouchableOpacity onPress={pickImage} className="border-2 border-dashed border-slate-300 rounded-xl p-8 items-center justify-center mt-2 bg-slate-50 active:bg-slate-100">
                            {image ? (
                                <View className="items-center">
                                    <View className="w-20 h-20 bg-slate-200 mb-2 rounded-lg overflow-hidden">
                                        {/* Minimal Image Preview */}
                                        <View className="w-full h-full bg-emerald-100 items-center justify-center">
                                            <FontAwesome5 name="check" size={24} color="#059669" />
                                        </View>
                                    </View>
                                    <Text className="text-emerald-600 font-bold">ID Card Selected</Text>
                                </View>
                            ) : (
                                <>
                                    <FontAwesome5 name="id-card" size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                                    <Text className="text-slate-400 font-bold">Tap to upload Student ID</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSignup} disabled={loading} className={`w-full py-4 rounded-xl mt-4 ${loading ? 'bg-slate-300' : 'bg-slate-900'}`}>
                            <Text className="text-white text-center font-bold text-lg">{loading ? 'Creating...' : 'Sign Up'}</Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-4 pb-8">
                            <Text className="text-slate-500 font-bold">Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity><Text className="text-blue-600 font-bold">Login</Text></TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* University Selection Modal */}
            <Modal visible={showUniModal} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-3/4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-slate-900">Select University</Text>
                            <TouchableOpacity onPress={() => setShowUniModal(false)} className="p-2 bg-slate-100 rounded-full">
                                <FontAwesome5 name="times" size={16} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={UK_UNIVERSITIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="py-4 border-b border-slate-100"
                                    onPress={() => {
                                        setForm({ ...form, university: item });
                                        setShowUniModal(false);
                                    }}
                                >
                                    <Text className={`text-lg ${form.university === item ? 'font-bold text-blue-600' : 'text-slate-700'}`}>
                                        {item}
                                    </Text>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
<<<<<<< HEAD
        </SafeAreaView>
=======
        </SafeAreaView >
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    );
}
