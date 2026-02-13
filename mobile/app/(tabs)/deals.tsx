import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import DealCard from '../../components/DealCard';
import { useFilter } from '../../context/FilterContext';

export default function DealsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { activeCategory, setActiveCategory } = useFilter();

    // Use local state for this screen's search if desired, or sync with global
    const [search, setSearch] = useState('');

    const initialCategory = params.category ? String(params.category) : 'All';

    // If param passed, sync to context once (optional)
    React.useEffect(() => {
        if (initialCategory && initialCategory !== 'All') {
            setActiveCategory(initialCategory);
        }
    }, [initialCategory]);

    const { data: deals, isLoading, refetch } = useQuery({
        queryKey: ['all-deals', activeCategory, search],
        queryFn: async () => {
            let url = `/public/deals?`;
            if (activeCategory !== 'All') url += `&category=${encodeURIComponent(activeCategory)}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await api.get(url);
            return res.data.deals || [];
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-5 py-3 border-b border-slate-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">All Deals</Text>
            </View>

            {/* Search Bar */}
            <View className="px-5 py-4">
                <View className="flex-row items-center bg-slate-50 px-4 h-12 rounded-xl border border-slate-200">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search deals..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-3 font-medium text-slate-900"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            ) : (
                <FlatList
                    data={deals}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <DealCard deal={item} />
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
