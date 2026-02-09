import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import api from '../../utils/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DealCard from '../../components/DealCard';
import BrandPageSkeleton from '../../components/BrandPageSkeleton';
import { useAuth } from '../../context/AuthContext';

export default function BusinessProfile() {
    const { id, name, logo, cover, latitude, longitude, address } = useLocalSearchParams();
    const router = useRouter();
    const { toggleFollow, isFollowing } = useAuth();

    // Optimistic UI: We already have name, logo, cover from navigation params
    // Show them immediately while fetching deals in background
    const businessName = name as string || "Business Profile";
    const logoUri = (logo as string) || undefined;
    const coverUri = (cover as string) || undefined;

    // Use cached deals query - should be instant from cache
    const { data: allDeals, isLoading } = useQuery({
        queryKey: ['deals'],
        queryFn: async () => {
            const res = await api.get('/public/deals');
            if (res.data && Array.isArray(res.data.deals)) return res.data.deals;
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const businessDeals = useMemo(() => {
        if (!allDeals) return [];
        return allDeals.filter((d: any) => d.business && d.business.businessName === name);
    }, [allDeals, name]);

    // Show skeleton only if we don't have the header data yet
    // Since we pass it via params, this should rarely show
    if (isLoading && !businessName) {
        return <BrandPageSkeleton />;
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Main List with Header */}
            <FlashList<any>
                data={businessDeals}
                estimatedListSize={{ height: 250, width: 375 }}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListHeaderComponent={() => (
                    <View>
                        {/* Header / Cover */}
                        <View className="h-48 relative bg-slate-200">
                            {coverUri && (
                                <Image
                                    source={{ uri: coverUri }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    transition={200}
                                    cachePolicy="memory-disk"
                                />
                            )}
                            <View className="absolute inset-0 bg-black/40" />

                            <SafeAreaView className="absolute top-0 left-0 w-full">
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    className="ml-6 mt-2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
                                >
                                    <FontAwesome5 name="arrow-left" size={16} color="white" />
                                </TouchableOpacity>
                            </SafeAreaView>
                        </View>

                        {/* Profile Info */}
                        <View className="-mt-12 px-6 mb-6">
                            <View className="flex-row items-end">
                                {logoUri ? (
                                    <Image
                                        source={{ uri: logoUri }}
                                        style={{ width: 96, height: 96 }}
                                        className="rounded-2xl border-4 border-white bg-white"
                                        contentFit="cover"
                                        transition={200}
                                        cachePolicy="memory-disk"
                                    />
                                ) : (
                                    <View className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 items-center justify-center">
                                        <FontAwesome5 name="store" size={32} color="#94a3b8" />
                                    </View>
                                )}
                            </View>
                            <View className="mt-4 flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-2xl font-black text-slate-900">{businessName}</Text>
                                    <Text className="text-slate-500 font-bold text-sm">Official Partner</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => toggleFollow(businessName)}
                                    className={`px-6 py-3 rounded-full ${isFollowing(businessName) ? 'bg-slate-100 border border-slate-200' : 'bg-blue-600'}`}
                                >
                                    <Text className={`font-bold text-sm ${isFollowing(businessName) ? 'text-slate-700' : 'text-white'}`}>
                                        {isFollowing(businessName) ? 'Following' : 'Follow'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text className="text-slate-400 text-xs mt-3 leading-relaxed">
                                Offering exclusive discounts to students. Check out our latest deals below.
                            </Text>

                            {/* Location Map */}
                            {latitude && longitude && (
                                <View className="mt-6 rounded-2xl overflow-hidden border border-slate-200">
                                    <MapView
                                        style={{ width: '100%', height: 180 }}
                                        initialRegion={{
                                            latitude: parseFloat(latitude as string),
                                            longitude: parseFloat(longitude as string),
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        scrollEnabled={false}
                                        liteMode={true} // Performance optimization
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: parseFloat(latitude as string),
                                                longitude: parseFloat(longitude as string),
                                            }}
                                            title={businessName}
                                        />
                                    </MapView>
                                    <View className="bg-slate-50 p-3 flex-row items-center gap-2">
                                        <FontAwesome5 name="map-marker-alt" size={12} color="#64748b" />
                                        <Text className="text-xs text-slate-500 font-bold" numberOfLines={1}>
                                            {address || "Business Location"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Active Deals Title */}
                        <View className="px-6 mb-4">
                            <Text className="text-lg font-black text-slate-900">
                                Active Offers ({isLoading ? '...' : businessDeals.length})
                            </Text>
                        </View>

                        {/* Show skeleton for deals if still loading */}
                        {isLoading && (
                            <View className="px-6">
                                {[1, 2, 3].map((i) => (
                                    <View key={i} className="h-64 bg-slate-100 rounded-2xl mb-4 animate-pulse" />
                                ))}
                            </View>
                        )}
                    </View>
                )}
                renderItem={({ item }: { item: any }) => (
                    <View className="px-6 mb-4">
                        <DealCard deal={item} userLocation={null} />
                    </View>
                )}
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center mt-10 px-6">
                            <Text className="text-slate-400 font-bold">No active deals right now.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

