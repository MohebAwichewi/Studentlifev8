import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import DealCard from '../../components/DealCard';
import { useFilter } from '../../context/FilterContext';

export default function DealListScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { title, sortType } = params; // sortType: 'distance' | 'newest' | 'expiring'
    const { filterLocation } = useFilter();

    const { data: deals, isLoading, refetch } = useQuery({
        queryKey: ['deals-list', sortType, filterLocation],
        queryFn: async () => {
            // If no location, we can't reliably fetch distance-sorted deals, but standard fetch handles it.
            const res = await api.get('/public/deals', {
                params: {
                    lat: filterLocation?.latitude,
                    lng: filterLocation?.longitude,
                    radius: 50, // Wider radius for "See All" lists
                    sort: sortType
                }
            });
            return res.data.deals || [];
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900 flex-1">
                    {title || 'Deals'}
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            ) : (
                <FlatList
                    data={deals}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#E63946" />
                    }
                    renderItem={({ item }) => (
                        <View className="mb-2">
                            <DealCard deal={item} />
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-slate-500 font-bold">No deals found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
