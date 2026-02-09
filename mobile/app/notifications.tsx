import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();

    // Connect to backend notifications endpoint
    const { data: notifications, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/auth/student/notifications');
            return res.data.success ? res.data.notifications : [];
        }
    });

    // Refresh on focus
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-4">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Notifications</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#E63946" />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color="#E63946" className="mt-10" />
                ) : notifications && notifications.length > 0 ? (
                    notifications.map((notif: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                if (notif.dealId) router.push(`/deal/${notif.dealId}`);
                            }}
                            className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-row gap-4"
                        >
                            <View className={`w-2 h-2 rounded-full mt-2 ${notif.isRead ? 'bg-slate-300' : 'bg-blue-500'}`} />
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900">{notif.title}</Text>
                                <Text className="text-slate-500 text-xs mt-1">{notif.message}</Text>
                                {notif.type === 'WIN' && (
                                    <Text className="text-emerald-600 font-bold text-xs mt-2">Tap to Claim Prize →</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="items-center justify-center mt-20">
                        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                            <Ionicons name="notifications" size={20} color="#E63946" />
                        </View>
                        <Text className="text-lg font-bold text-slate-900">No New Notifications</Text>
                        <Text className="text-slate-400 text-center mt-2 px-10 leading-relaxed">
                            You're all caught up! Check back later for exclusive deals and updates.
                        </Text>
                    </View>
                )}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
