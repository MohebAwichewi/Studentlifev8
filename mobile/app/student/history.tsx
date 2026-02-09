import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, StatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const { data: redemptions, isLoading, refetch } = useQuery({
        queryKey: ['history', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            try {
                const res = await api.get(`/auth/student/redemptions?studentId=${user.id}`);
                return res.data.success ? res.data.redemptions : [];
            } catch (e) {

                return [];
            }
        },
        enabled: !!user?.id
    });

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
            <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm flex-row gap-4">
                <Image
                    source={{ uri: item.deal.image }}
                    className="w-16 h-16 rounded-xl bg-slate-100"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-slate-900 font-bold text-base leading-tight" numberOfLines={1}>
                        {item.deal.title}
                    </Text>
                    <Text className="text-slate-500 text-sm mt-1 mb-2">
                        {item.deal.business.businessName}
                    </Text>

                    <View className="bg-slate-50 self-start px-2 py-1 rounded-md border border-slate-100">
                        <Text className="text-slate-400 text-xs font-medium">
                            Redeemed: <Text className="text-slate-700 font-bold">{formattedDate} at {formattedTime}</Text>
                        </Text>
                    </View>
                </View>
                {/* Visual receipt check style */}
                <View className="justify-center items-end">
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 py-4 border-b border-slate-100 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Redemption History</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#000000" />
                </View>
            ) : (
                <FlatList
                    data={redemptions}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="receipt-outline" size={64} color="#e2e8f0" />
                            <Text className="text-slate-900 font-bold mt-6 text-lg">No redemptions yet</Text>
                            <Text className="text-slate-400 text-center mt-2 px-10">
                                Once you redeem deals in-store, they will appear here as your receipt.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
