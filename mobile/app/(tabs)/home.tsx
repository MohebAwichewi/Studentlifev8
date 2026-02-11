import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Dimensions, ScrollView, FlatList, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import DealCard from '../../components/DealCard';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useFilter } from '../../context/FilterContext';

const { width } = Dimensions.get('window');

// Category Pills Component
const CategoryPills = () => {
    const { activeCategory, setActiveCategory } = useFilter();

    // Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await api.get('/public/categories');
                return res.data.categories || [];
            } catch (e) { return []; }
        }
    });

    const categories = ['All', ...(categoriesData?.map((c: any) => c.name) || [])];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
            {categories.map((cat, index) => (
                <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl border ${activeCategory === cat ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
                >
                    <Text className={`text-sm font-bold ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>
                        {cat}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

import SpinWheel from '../../components/SpinWheel';
import NoSpinPopup from '../../components/NoSpinPopup';

// ... existing imports ...

export default function HomeScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const {
        filterLocation,
        setFilterLocation,
        filterRadius,
        searchQuery,
        setSearchQuery,
        isFiltering,
        activeCategory
    } = useFilter();

    const [cityName, setCityName] = useState("Locating...");
    const [showSpinWheel, setShowSpinWheel] = useState(false);
    const [showNoSpinPopup, setShowNoSpinPopup] = useState(false); // ✅ New State
    const [showingFallback, setShowingFallback] = useState(false);

    useEffect(() => {
        if (filterLocation) {
            (async () => {
                try {
                    const [address] = await Location.reverseGeocodeAsync({
                        latitude: filterLocation.latitude,
                        longitude: filterLocation.longitude
                    });
                    if (address && address.city) {
                        setCityName(address.city);
                    } else if (address && address.name) {
                        setCityName(address.name);
                    } else {
                        setCityName("Unknown Location");
                    }
                } catch (e) {
                    setCityName("Location Error");
                }
            })();
        }
    }, [filterLocation]);

    // Check for Active Prizes (Background Fetch)
    const { data: activePrizes } = useQuery({
        queryKey: ['activePrizes'],
        queryFn: async () => {
            try {
                if (!user) return [];
                const res = await api.get('/auth/student/prizes');
                return res.data.prizes || [];
            } catch (e) { return []; }
        },
        enabled: !!user
    });

    // Data Fetching (Deals)
    const { data: allDeals, isLoading, refetch } = useQuery({
        queryKey: ['deals', filterLocation, searchQuery, activeCategory],
        queryFn: async () => {
            if (!filterLocation) return [];
            try {
                const res = await api.get('/public/deals', {
                    params: {
                        lat: filterLocation.latitude,
                        lng: filterLocation.longitude,
                        radius: 100, // Fetch all deals within 100km
                        search: searchQuery,
                        category: activeCategory
                    }
                });
                return res.data.deals || [];
            } catch (e) {
                return [];
            }
        },
        enabled: !!filterLocation
    });

    // Client-side radius filtering with fallback
    const { deals, isFallback } = useMemo(() => {
        if (!allDeals || !filterLocation) return { deals: [], isFallback: false };

        // Calculate distance for each deal
        const dealsWithDistance = allDeals.map((deal: any) => {
            const dealLat = deal.business?.latitude;
            const dealLng = deal.business?.longitude;

            if (!dealLat || !dealLng) return { ...deal, distance: Infinity };

            // Haversine formula for distance
            const R = 6371; // Earth's radius in km
            const dLat = (dealLat - filterLocation.latitude) * Math.PI / 180;
            const dLon = (dealLng - filterLocation.longitude) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(filterLocation.latitude * Math.PI / 180) * Math.cos(dealLat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            return { ...deal, distance };
        });

        // Filter by radius
        const withinRadius = dealsWithDistance.filter((d: any) => d.distance <= filterRadius);

        if (withinRadius.length > 0) {
            setShowingFallback(false);
            return { deals: withinRadius, isFallback: false };
        }

        // No deals within radius - show closest ones
        const sortedByDistance = dealsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
        setShowingFallback(true);
        return { deals: sortedByDistance.slice(0, 10), isFallback: true };
    }, [allDeals, filterLocation, filterRadius]);

    const topPicksNearYou = deals?.filter((d: any) => !d.isSoldOut).slice(0, 5) || [];
    const recentlyAdded = deals?.slice(0, 5) || [];
    const expiringSoon = deals?.slice(0, 5) || [];

    const renderSection = (title: string, data: any[], sortType: string) => {
        if (!data || data.length === 0) return null;
        return (
            <View className="mt-6">
                <View className="flex-row items-center justify-between px-6 mb-3">
                    <Text className="text-lg font-black text-slate-900">{title}</Text>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/deal/list',
                            params: { title, sortType }
                        })}
                    >
                        <Text className="text-emerald-600 font-bold text-sm">See all</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    horizontal
                    data={data}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                    renderItem={({ item }) => (
                        <View style={{ width: 280 }}>
                            <DealCard deal={item} />
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    {/* Location Button (Existing) */}
                    <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                        <Ionicons name="navigate" size={16} color="#E63946" />
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/(tabs)/map', params: { openFilter: Date.now().toString(), returnToHome: 'true' } })}
                    >
                        <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Location</Text>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-sm font-black text-slate-900">
                                {searchQuery ? "Searching..." : cityName}
                            </Text>
                            <Ionicons name="chevron-down" size={12} color="#0f172a" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Right Side Icons */}
                <View className="flex-row items-center gap-3">
                    {/* SPIN BUTTON */}
                    <TouchableOpacity
                        onPress={() => {
                            if (!user) {
                                router.push('/(auth)/login');
                                return;
                            }
                            // Strict Check: activePrizes must be an array and have length
                            if (!activePrizes || activePrizes.length === 0) {
                                setShowNoSpinPopup(true); // ✅ Show Custom Popup
                                return;
                            }
                            setShowSpinWheel(true);
                        }}
                        className="w-10 h-10 rounded-full bg-red-600 items-center justify-center shadow-sm"
                    >
                        <Ionicons name="gift" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* BELL ICON (Restored) */}
                    <TouchableOpacity
                        onPress={() => router.push('/notifications')}
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 items-center justify-center"
                    >
                        <Ionicons name="notifications-outline" size={20} color="#0f172a" />
                        {/* Dot indicator could go here if unread */}
                    </TouchableOpacity>
                </View>
            </View>

            {/* ... Existing Search & Filter ... */}
            {/* ... Existing ScrollView ... */}
            <View className="px-6 mb-4 flex-row gap-3">
                <View className="flex-1 flex-row items-center bg-[#F7F7F7] px-4 h-12 rounded-xl">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search for food..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-3 font-medium text-slate-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#E63946" />}
            >
                <CategoryPills />

                {isLoading ? (
                    <View className="mt-20">
                        <ActivityIndicator size="large" color="#E63946" />
                    </View>
                ) : (
                    <>
                        {!deals || deals.length === 0 ? (
                            <View className="items-center justify-center mt-20">
                                <Text className="text-slate-500 font-bold">No deals found nearby.</Text>
                                <TouchableOpacity onPress={() => {
                                    setFilterLocation(null);
                                    refetch();
                                }} className="mt-4">
                                    <Text className="text-primary font-bold">Reset filters</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* Fallback Message if Closest Deal is out of Radius */}
                                {deals[0]?.distance > 30 && (
                                    <View className="px-6 mb-2">
                                        <View className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                            <Text className="text-orange-800 font-bold text-center text-sm">
                                                No offers found in this exact location. Here are the closest offers to you:
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {renderSection("Top picks Near you", topPicksNearYou, 'distance')}
                                {renderSection("Recently added", recentlyAdded, 'newest')}
                                {renderSection("Expiring soon", expiringSoon, 'expiring')}
                            </>
                        )}

                        <View className="h-20" />
                    </>
                )}
            </ScrollView>

            <SpinWheel visible={showSpinWheel} onClose={() => setShowSpinWheel(false)} />
            <NoSpinPopup visible={showNoSpinPopup} onClose={() => setShowNoSpinPopup(false)} />

        </SafeAreaView >
    );
}
