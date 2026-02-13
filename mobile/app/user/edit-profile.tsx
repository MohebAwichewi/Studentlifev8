import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, signIn } = useAuth(); // signIn allows updating user context
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [city, setCity] = useState(user?.city || '');
    const [university, setUniversity] = useState(user?.university || '');
    const [dob, setDob] = useState(user?.dob || '');

    const handleSave = async () => {
        if (!fullName || !phone) {
            Alert.alert("Missing Fields", "Name and Phone are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/auth/user/update-profile', {
                userId: user?.id,
                fullName,
                phone,
                city,
                university,
                dob
            });

            if (res.data.success) {
                Alert.alert("Success", "Profile updated successfully!");
                // Update local context if possible, otherwise rely on refresh or re-login logic
                // For now, we manually update the user object if AuthContext supports it, or just generic success.
                // Assuming AuthContext handles session refresh or we assume success.
                // Optimistic update for now or just navigate back.
                router.back();
            } else {
                Alert.alert("Error", res.data.error || "Update failed");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.error || "Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-lg font-black text-slate-900">Edit Profile</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="p-6">
                <View className="space-y-6">
                    <View>
                        <Text className="text-slate-500 font-bold mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Your Name"
                        />
                    </View>

                    <View>
                        <Text className="text-slate-500 font-bold mb-2 ml-1">Phone Number</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View>
                        <Text className="text-slate-500 font-bold mb-2 ml-1">City</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            value={city}
                            onChangeText={setCity}
                            placeholder="City"
                        />
                    </View>

                    <View>
                        <Text className="text-slate-500 font-bold mb-2 ml-1">University</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            value={university}
                            onChangeText={setUniversity}
                            placeholder="University"
                        />
                    </View>

                    <View>
                        <Text className="text-slate-500 font-bold mb-2 ml-1">Date of Birth</Text>
                        <TextInput
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900"
                            value={dob}
                            onChangeText={setDob}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className="mt-10 bg-slate-900 p-4 rounded-xl items-center shadow-lg shadow-slate-300"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
