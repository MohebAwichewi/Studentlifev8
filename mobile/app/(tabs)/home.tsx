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
