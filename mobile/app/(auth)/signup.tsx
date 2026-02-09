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
];

export default function SignupScreen() {
    const [form, setForm] = useState({
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
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
            formData.append('university', form.university);
            formData.append('fullName', `${form.firstName} ${form.lastName}`);

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('idImage', { uri: image, name: filename, type });
            }

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
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
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}
