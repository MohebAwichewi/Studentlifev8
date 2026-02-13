import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DealCard from '../../components/DealCard';

export default function SavedDealsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedDeals = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/auth/user/saved-deals?userId=${user.id}`);
            if (res.data.success) {
                setDeals(res.data.deals);
            }
        } catch (error) {
            console.error("Failed to fetch saved deals", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSavedDeals();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedDeals();
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Saved Deals</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0f172a" />
                </View>
            ) : (
                <FlatList
                    data={deals}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => <DealCard deal={item} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-20 px-10">
                            <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="heart" size={40} color="#ef4444" />
                            </View>
                            <Text className="text-slate-900 font-bold text-lg">No saved deals yet</Text>
                            <Text className="text-slate-400 text-center mt-2">
                                Tap the heart icon on any deal to save it for later.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
