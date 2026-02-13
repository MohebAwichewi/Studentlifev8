import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Linking, Alert, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('English');

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => {
                        signOut();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const MenuItem = ({ icon, label, subLabel, onPress, color = "#0f172a", iconType = "fa5" }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl mb-3 shadow-sm shadow-slate-100 active:bg-slate-50"
        >
            <View className="flex-row items-center gap-4">
                <View className={`w-10 h-10 rounded-full items-center justify-center bg-slate-50`}>
                    {iconType === 'fa5' ? (
                        <FontAwesome5 name={icon} size={18} color={color} />
                    ) : (
                        <Ionicons name={icon} size={20} color={color} />
                    )}
                </View>
                <View>
                    <Text className="font-bold text-slate-900 text-base">{label}</Text>
                    {subLabel && <Text className="text-slate-400 text-xs">{subLabel}</Text>}
                </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="px-6 pt-6 pb-8 bg-white border-b border-slate-50">
                    <Text className="text-3xl font-black text-slate-900 mb-6">Profile</Text>

                    <View className="flex-row items-center gap-4">
                        <View className="relative">
                            <View className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-50 shadow-sm">
                                {user?.photo ? (
                                    <Image source={{ uri: user.photo }} className="w-full h-full" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-blue-100">
                                        <Text className="text-2xl font-black text-blue-500">
                                            {user?.fullName?.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/user/edit-profile')}
                                className="absolute bottom-0 right-0 bg-slate-900 w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow-sm"
                            >
                                <FontAwesome5 name="pen" size={10} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1">
                            <Text className="text-xl font-bold text-slate-900 mb-0.5" numberOfLines={1}>{user?.fullName || "Guest User"}</Text>
                            <Text className="text-slate-500 text-sm mb-1">{user?.email || "Sign in to access features"}</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="location-sharp" size={14} color="#94a3b8" />
                                <Text className="text-slate-400 text-xs font-bold ml-1">{user?.city || "Tunis, Tunisia"}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-6 pt-6">
                    {/* Orders Group */}
                    <Text className="text-xs font-black text-slate-300 uppercase mb-3 ml-2 tracking-wider">My Wallet</Text>
                    <MenuItem
                        icon="ticket-alt"
                        label="Active Orders"
                        subLabel="View your ready-to-use tickets"
                        color="#3b82f6"
                        onPress={() => router.push({ pathname: '/(tabs)/wallet', params: { tab: 'active' } })}
                    />
                    <MenuItem
                        icon="history"
                        label="Past Orders"
                        color="#64748b"
                        onPress={() => router.push({ pathname: '/(tabs)/wallet', params: { tab: 'history' } })}
                    />

                    {/* Discovery Group */}
                    <Text className="text-xs font-black text-slate-300 uppercase mb-3 ml-2 mt-6 tracking-wider">Discovery</Text>
                    <MenuItem
                        icon="heart"
                        label="Saved Deals"
                        color="#ef4444"
                        onPress={() => router.push('/user/saved-deals')}
                    />
                    <MenuItem
                        icon="store"
                        label="Followed Shops"
                        color="#8b5cf6"
                        // onPress={() => router.push('/user/following')} 
                        onPress={() => { }}
                        subLabel="Coming Soon"
                    />

                    {/* Preferences Group */}
                    <Text className="text-xs font-black text-slate-300 uppercase mb-3 ml-2 mt-6 tracking-wider">Preferences</Text>
                    <MenuItem
                        icon="notifications"
                        iconType="ionic"
                        label="Notifications"
                        color="#f59e0b"
                        onPress={() => router.push('/user/notifications')}
                    />
                    <MenuItem
                        icon="language"
                        iconType="ionic"
                        label="Language"
                        subLabel={currentLanguage}
                        color="#10b981"
                        onPress={() => setLanguageModalVisible(true)}
                    />

                    {/* Support Group */}
                    <Text className="text-xs font-black text-slate-300 uppercase mb-3 ml-2 mt-6 tracking-wider">Support</Text>
                    <MenuItem
                        icon="headset"
                        label="Help & Support"
                        color="#0f172a"
                        onPress={() => Linking.openURL('mailto:support@winapp.tn')}
                    />
                    <MenuItem
                        icon="file-alt"
                        label="Terms & Privacy"
                        color="#0f172a"
                        onPress={() => Linking.openURL('https://win.tn/privacy')}
                    />

                    {/* Logout */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-8 mb-4 flex-row items-center justify-center p-4 rounded-2xl border border-red-100 bg-red-50"
                    >
                        <MaterialIcons name="logout" size={20} color="#dc2626" />
                        <Text className="text-red-600 font-bold ml-2">Sign Out</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-slate-300 text-[10px] font-bold">Version 1.0.0 (Build 2024)</Text>
                </View>
            </ScrollView>

            {/* Language Modal */}
            <Modal
                visible={languageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setLanguageModalVisible(false)}
                    className="flex-1 bg-black/60 justify-center items-center p-6"
                >
                    <View className="bg-white w-full rounded-3xl p-6">
                        <Text className="text-xl font-black text-slate-900 mb-6 text-center">Select Language</Text>

                        {['English', 'Français', 'العربية'].map((lang) => (
                            <TouchableOpacity
                                key={lang}
                                onPress={() => {
                                    setCurrentLanguage(lang);
                                    setLanguageModalVisible(false);
                                }}
                                className={`p-4 rounded-xl mb-3 border ${currentLanguage === lang ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <Text className={`text-center font-bold ${currentLanguage === lang ? 'text-white' : 'text-slate-700'}`}>
                                    {lang}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setLanguageModalVisible(false)}
                            className="mt-2 p-4"
                        >
                            <Text className="text-slate-400 font-bold text-center">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
