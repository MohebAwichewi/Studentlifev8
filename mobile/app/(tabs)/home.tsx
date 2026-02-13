import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import api from '../../utils/api';
import DealCard from '../../components/DealCard';
import haversine from 'haversine';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'border-all' },
    { id: 'food', name: 'Food', icon: 'utensils' },
    { id: 'fun', name: 'Fun', icon: 'gamepad' },
    { id: 'health', name: 'Health', icon: 'heartbeat' },
    { id: 'services', name: 'Services', icon: 'cut' },
    { id: 'shopping', name: 'Shop', icon: 'shopping-bag' },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Get User Location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Reverse Geocode for City (Optional - could use API)
            // let place = await Location.reverseGeocodeAsync(loc.coords);
            // if (place[0]?.city) setCity(place[0].city);
        })();
    }, []);

    const { data: allDeals, isLoading, refetch } = useQuery({
        queryKey: ['deals', city],
        queryFn: async () => {
            const res = await api.get('/public/deals');
            return res.data.deals || [];
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Filter Deals Logic
    let deals = allDeals || [];
    if (selectedCategory !== 'all') {
        deals = deals.filter((d: any) => d.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort by Distance
    const nearbyDeals = location ? [...deals].sort((a: any, b: any) => {
        if (!a.business?.latitude || !b.business?.latitude) return 0;
        const start = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        const distA = haversine(start, { latitude: a.business.latitude, longitude: a.business.longitude });
        const distB = haversine(start, { latitude: b.business.latitude, longitude: b.business.longitude });
        return distA - distB;
    }).slice(0, 10) : deals.slice(0, 10);

    // Trending (Mock sort by discount for now)
    const trendingDeals = [...deals].sort((a: any, b: any) => parseFloat(b.discountValue) - parseFloat(a.discountValue)).slice(0, 5);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm shadow-slate-100 z-10">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-slate-900 rounded-full items-center justify-center">
                        <Text className="text-white font-black text-xs">WIN</Text>
                    </View>
                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Location</Text>
                        <TouchableOpacity className="flex-row items-center gap-1">
                            <Text className="text-slate-900 font-black text-lg">{city || 'Tunis'}</Text>
                            <FontAwesome5 name="chevron-down" size={12} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/user/notifications')} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full items-center justify-center relative">
                    <Ionicons name="notifications-outline" size={20} color="#0f172a" />
                    <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/search')} className="px-6 py-4">
                    <View className="bg-white p-4 rounded-2xl shadow-sm shadow-slate-200 flex-row items-center gap-3 border border-slate-100">
                        <Ionicons name="search" size={24} color="#94a3b8" />
                        <View className="flex-1">
                            <Text className="text-slate-400 font-bold text-base">Search deals, food, shops...</Text>
                        </View>
                        <View className="bg-slate-100 p-2 rounded-lg">
                            <Ionicons name="options-outline" size={20} color="#0f172a" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-8" contentContainerStyle={{ gap: 12, paddingRight: 40 }}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            className={`flex-row items-center px-5 py-3 rounded-full border ${selectedCategory === cat.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                        >
                            <FontAwesome5 name={cat.icon} size={14} color={selectedCategory === cat.id ? 'white' : '#64748b'} />
                            <Text className={`ml-2 font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Trending Section */}
                <View className="px-6 mb-4 flex-row justify-between items-center">
                    <Text className="text-xl font-black text-slate-900">Trending Now 🔥</Text>
                    <TouchableOpacity><Text className="text-slate-500 font-bold text-xs">See All</Text></TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" className="mb-8" color="#0f172a" />
                ) : (
                    <FlatList
                        horizontal
                        data={trendingDeals}
                        keyExtractor={(item: any) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}
                        renderItem={({ item }) => (
                            <View style={{ width: width * 0.75 }}>
                                <DealCard deal={item} />
                            </View>
                        )}
                    />
                )}

                {/* Nearby Section */}
                <View className="px-6 mb-4 mt-2 flex-row justify-between items-center">
                    <Text className="text-xl font-black text-slate-900">Near You 📍</Text>
                    <TouchableOpacity><Text className="text-slate-500 font-bold text-xs">See All</Text></TouchableOpacity>
                </View>

                <View className="px-6 pb-24 space-y-4">
                    {nearbyDeals.map((deal: any) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                    {!isLoading && nearbyDeals.length === 0 && (
                        <Text className="text-slate-400 text-center font-bold py-8">No deals found nearby.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
