import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import api from '../../utils/api'; // Assuming you have an api wrapper, or fetch directly

import CustomPopup from '../../components/CustomPopup';

export default function ProfileScreen() {
    const { user, signOut, updateUser } = useAuth();
    const router = useRouter();
    const [showNameModal, setShowNameModal] = useState(false);
    const [editedName, setEditedName] = useState(user?.fullName || '');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Avatar State
    const avatarStyles = ['avataaars', 'open-peeps', 'adventurer', 'big-smile', 'croodles'];
    const avatarColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
    const [selectedStyle, setSelectedStyle] = useState('open-peeps');
    const [selectedColor, setSelectedColor] = useState('b6e3f4');
    const [previewSeed, setPreviewSeed] = useState(user?.id || 'seed');

    // Sync Seed with User ID
    useEffect(() => {
        if (user?.id) {
            setPreviewSeed(user.id);
        }
    }, [user?.id]);

    // Parse existing avatar on mount/user change
    useEffect(() => {
        if (user?.profilePicture && user.profilePicture.includes('dicebear.com')) {
            try {
                // Example: https://api.dicebear.com/7.x/open-peeps/png?seed=...&backgroundColor=...
                const url = user.profilePicture;
                const styleMatch = url.match(/7\.x\/([^/]+)\/png/);
                const colorMatch = url.match(/backgroundColor=([^&]+)/);

                if (styleMatch && styleMatch[1]) setSelectedStyle(styleMatch[1]);
                if (colorMatch && colorMatch[1]) setSelectedColor(colorMatch[1]);
            } catch (e) {
                console.log("Error parsing avatar URL", e);
            }
        }
    }, [user?.profilePicture]);

    const getAvatarUrl = (style: string, color: string, seed: string) => {
        return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&backgroundColor=${color}`;
    };

    const [isSavingAvatar, setIsSavingAvatar] = useState(false);

    const handleSaveAvatar = async () => {
        if (!user) return;
        setIsSavingAvatar(true);
        const newAvatarUrl = getAvatarUrl(selectedStyle, selectedColor, previewSeed);
        console.log("Saving Avatar:", newAvatarUrl); // DEBUG LOG

        try {
            // 2. API Call (Switched to fetch for stability)
            const token = await SecureStore.getItemAsync('student_token');
            const baseURL = api.defaults.baseURL || 'https://student-life.uk/api';

            const response = await fetch(`${baseURL}/auth/student/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ profilePicture: newAvatarUrl }),
            });

            const data = await response.json();
            console.log("Avatar Save Response:", data); // DEBUG LOG

            if (response.ok && data.success) {
                // 1. Update Context with response user to ensure sync
                if (data.user) {
                    await updateUser(data.user);
                } else {
                    // Fallback if API doesn't return user
                    await updateUser({ ...user, profilePicture: newAvatarUrl });
                }

                showPopup('Success', 'Avatar updated!');
                setShowAvatarModal(false);
            } else {
                console.error("Avatar Save Failed API:", data);
                showPopup('Error', 'Failed to save avatar');
            }
        } catch (e: any) {
            const errorMsg = e.message || 'Unknown Error';
            console.error("Avatar Save Error:", errorMsg);
            // Alert.alert("Save Failed", typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
            showPopup('Error', 'Failed to update avatar.');
        } finally {
            setIsSavingAvatar(false);
        }
    };

    // Custom Popup State
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupData, setPopupData] = useState({ title: '', message: '' });

    const showPopup = (title: string, message: string) => {
        setPopupData({ title, message });
        setPopupVisible(true);
    };

    const handleLogout = () => {
        signOut();
        router.replace('/(auth)/login');
    }

    const handleSaveName = async () => {
        if (!user) return;
        try {
            const token = await SecureStore.getItemAsync('student_token');
            const baseURL = api.defaults.baseURL || 'https://student-life.uk/api';

            const response = await fetch(`${baseURL}/auth/student/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ fullName: editedName }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showPopup('Success', 'Name updated successfully');
                setShowNameModal(false);
                if (data.user) {
                    await updateUser(data.user);
                }
            } else {
                showPopup('Error', data.error || 'Failed to update name');
            }
        } catch (e) {
            console.error("Name Update Error:", e);
            showPopup('Error', 'Failed to update name');
        }
    }

    const handleUploadID = async () => {
        Alert.alert(
            "Upload ID",
            "Choose an option",
            [
                {
                    text: "Take Photo",
                    onPress: openCamera,
                },
                {
                    text: "Choose from Gallery",
                    onPress: openGallery,
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Needed", "We need access to your photos to upload your ID.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 10], // ID Card Ratio (Landscape)
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadID(result.assets[0]);
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Needed", "We need access to your camera to upload your ID.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 10], // ID Card Ratio (Landscape)
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadID(result.assets[0]);
        }
    };

    const uploadID = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!user?.email) return;

        try {
            showPopup('Uploading...', 'Please wait while we verify your ID.');

            const formData = new FormData();
            formData.append('email', user.email);
            formData.append('idImage', {
                uri: asset.uri,
                type: 'image/jpeg', // Adjust based on asset.type if needed
                name: 'student_id.jpg',
            } as any);

            // Get token for auth
            const token = await SecureStore.getItemAsync('student_token');
            const baseURL = api.defaults.baseURL || 'https://student-life.uk/api';

            // Use fetch specifically for Multipart/FormData to avoid common Axios/RN issues
            const response = await fetch(`${baseURL}/auth/student/upload-id`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Explicitly do NOT set Content-Type so boundary is set automatically
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showPopup('Success', 'ID uploaded successfully! Status updated.');
                if (data.user) {
                    await updateUser(data.user);
                }
            } else {
                throw new Error(data.error || "Upload failed");
            }

        } catch (e: any) {
            const errorMsg = e.message || 'Unknown Error';
            console.error("ID Upload Error:", errorMsg);
            showPopup('Error', typeof errorMsg === 'string' ? errorMsg : "Failed to upload ID.");
        }
    };

    const openLocationSettings = () => {
        Linking.openSettings();
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-6">
                <Text className="text-3xl font-black text-slate-900 mb-6">Profile</Text>

                <View className="bg-slate-50 p-6 rounded-2xl mb-6 flex-row items-center gap-4">
                    <View className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden">
                        {user?.profilePicture && user.profilePicture.length > 0 ? (
                            <Image
                                source={{ uri: user.profilePicture }}
                                className="w-full h-full"
                                resizeMode="cover"
                            /> // Need to import expo-image or react-native Image
                        ) : (
                            <View className="w-full h-full bg-slate-300 items-center justify-center">
                                <Ionicons name="person" size={32} color="white" />
                            </View>
                        )}
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900">{user?.fullName}</Text>
                        <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                            <Text className="text-red-600 font-bold text-sm">Customize Avatar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-xs font-bold text-slate-400 uppercase mb-4 ml-2">Account</Text>
                <View className="space-y-4">
                    <TouchableOpacity
                        onPress={() => setShowNameModal(true)}
                        className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
                    >
                        <Text className="font-bold text-slate-700">Display Name</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-400 text-sm">{user?.fullName}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/student/history')}
                        className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
                    >
                        <Text className="font-bold text-slate-700">Redemption History</Text>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => showPopup('University', user?.university || 'Not set')}
                        className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
                    >
                        <Text className="font-bold text-slate-700">University</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-400 text-sm">{user?.university}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleUploadID}
                        className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
                    >
                        <View>
                            <Text className="font-bold text-slate-700">Student ID Verification</Text>
                            {/* Status Text beneath title */}
                            {!user?.isVerified ? (
                                <Text className="text-red-500 text-xs font-bold mt-1">Action Required</Text>
                            ) : (
                                <Text className="text-red-600 text-xs font-bold mt-1">Verified</Text>
                            )}
                        </View>

                        <View className="flex-row items-center gap-2">
                            {user?.isVerified ? (
                                <View className="bg-red-100 p-1 rounded-full">
                                    <Ionicons name="checkmark" size={12} color="#E63946" />
                                </View>
                            ) : (
                                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <Text className="text-xs font-bold text-slate-400 uppercase mb-4 ml-2 mt-8">Preferences</Text>
                <View className="space-y-4">

                    <TouchableOpacity
                        onPress={openLocationSettings}
                        className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl"
                    >
                        <Text className="font-bold text-slate-700">Location Services</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-400 text-sm">When in Use</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleLogout} className="mt-12 bg-red-50 p-4 rounded-xl items-center border border-red-100">
                    <Text className="text-red-600 font-bold">Sign Out</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-300 text-xs mt-8">Version 1.0.0 (Expo)</Text>
            </ScrollView >

            {/* Custom Popup */}
            < CustomPopup
                visible={popupVisible}
                title={popupData.title}
                message={popupData.message}
                onClose={() => setPopupVisible(false)
                }
            />

            {/* Edit Name Modal */}
            <Modal
                visible={showNameModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNameModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <Text className="text-2xl font-black text-slate-900 mb-4">Edit Name</Text>
                        <TextInput
                            value={editedName}
                            onChangeText={setEditedName}
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-900 mb-6"
                            placeholder="Enter your name"
                        />
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowNameModal(false)}
                                className="flex-1 bg-slate-100 p-4 rounded-xl"
                            >
                                <Text className="text-slate-700 font-bold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveName}
                                className="flex-1 bg-blue-600 p-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Avatar Modal */}
            < AvatarModal
                visible={showAvatarModal}
                onClose={() => setShowAvatarModal(false)
                }
                onSave={handleSaveAvatar}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                stylesList={avatarStyles}
                colorsList={avatarColors}
                previewUrl={getAvatarUrl(selectedStyle, selectedColor, previewSeed)}
                previewSeed={previewSeed} // ✅ PASSED SEED
                isLoading={isSavingAvatar}
            />
        </SafeAreaView >
    );
}

// Avatar Modal Component
const AvatarModal = ({ visible, onClose, onSave, selectedStyle, setSelectedStyle, selectedColor, setSelectedColor, stylesList, colorsList, previewUrl, previewSeed, isLoading }: any) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-red-700 rounded-t-3xl p-8 h-[70%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white font-black text-2xl">Customize Avatar</Text>
                        <TouchableOpacity onPress={() => onClose()}>
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    <View className="items-center mb-8">
                        <View className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                            <Image source={{ uri: previewUrl }} className="w-full h-full" resizeMode="cover" />
                        </View>
                    </View>

                    <Text className="text-white font-bold mb-3 uppercase text-xs tracking-widest opacity-80">Style</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {stylesList.map((style: string) => (
                            <TouchableOpacity
                                key={style}
                                onPress={() => setSelectedStyle(style)}
                                className={`mr-4 p-1 rounded-full border-2 ${selectedStyle === style ? 'border-white' : 'border-transparent'}`}
                            >
                                <View className="w-14 h-14 bg-white rounded-full overflow-hidden">
                                    <Image
                                        // ✅ Use matched seed for accurate preview icon
                                        source={{ uri: `https://api.dicebear.com/7.x/${style}/png?seed=${previewSeed || 'icon'}` }}
                                        className="w-full h-full"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text className="text-white font-bold mb-3 uppercase text-xs tracking-widest opacity-80">Background</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
                        {colorsList.map((color: string) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`mr-4 p-1 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
                            >
                                <View style={{ backgroundColor: `#${color}` }} className="w-12 h-12 rounded-full" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        onPress={onSave}
                        disabled={isLoading}
                        className={`bg-white py-4 rounded-full shadow-lg ${isLoading ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-red-700 font-black text-center text-lg">
                            {isLoading ? "Saving..." : "Save Avatar"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
