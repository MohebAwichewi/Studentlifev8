import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, SafeAreaView, ActivityIndicator, Modal, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import * as Location from 'expo-location';
import DealCard from '../components/DealCard';
import haversine from 'haversine';
import Supercluster from 'supercluster';

const { width, height } = Dimensions.get('window');

export default function SearchScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isLocationModalVisible, setLocationModalVisible] = useState(false);

    // Data & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [mapRegion, setMapRegion] = useState<Region | null>(null);
    const [searchLocationCoords, setSearchLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);

    // Filters
    const [maxDistance, setMaxDistance] = useState(30); // Default 30km

    // Clustering State
    const [zoom, setZoom] = useState(12);
    const [bounds, setBounds] = useState<any>(null);

    // Initial Location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setUserLocation(loc);
            setSearchLocationCoords({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            setMapRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
        })();
    }, []);

    // Fetch Deals
    const { data: allDeals, isLoading } = useQuery({
        queryKey: ['search-deals'], // Fetch all for client-side filtering as requested by "Strict Rule"
        queryFn: async () => {
            const res = await api.get('/public/deals');
            return (res.data && Array.isArray(res.data.deals)) ? res.data.deals : [];
        }
    });

    // --- LOGIC: Filtering ---
    const filteredDeals = useMemo(() => {
        if (!allDeals) return [];

        let center = searchLocationCoords || (userLocation ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude
        } : null);

        return allDeals.filter((deal: any) => {
            // 1. Text Search (Shops/Products)
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matches = deal.title.toLowerCase().includes(q) ||
                    deal.business?.businessName?.toLowerCase().includes(q);
                if (!matches) return false;
            }

            // 2. Strict Distance Rule
            if (center && deal.business?.latitude && deal.business?.longitude) {
                const dealLoc = { latitude: deal.business.latitude, longitude: deal.business.longitude };
                const dist = haversine(center, dealLoc, { unit: 'km' });
                if (dist > maxDistance) return false;
            }

            return true;
        });
    }, [allDeals, searchQuery, maxDistance, searchLocationCoords, userLocation]);

    // --- LOGIC: Clustering ---
    const index = useMemo(() => {
        const idx = new Supercluster({
            radius: 40,
            maxZoom: 16,
        });
        const points = filteredDeals.map((d: any) => ({
            type: 'Feature',
            properties: { cluster: false, dealId: d.id, ...d },
            geometry: {
                type: 'Point',
                coordinates: [d.business.longitude, d.business.latitude],
            },
        }));
        idx.load(points);
        return idx;
    }, [filteredDeals]);

    const clusters = useMemo(() => {
        if (!bounds || !index) return [];
        return index.getClusters([bounds.west, bounds.south, bounds.east, bounds.north], zoom);
    }, [bounds, zoom, index]);

    // Map Region Change Handler
    const onRegionChangeComplete = (region: Region) => {
        setMapRegion(region);

        // Calculate BBox for Supercluster
        const west = region.longitude - region.longitudeDelta / 2;
        const east = region.longitude + region.longitudeDelta / 2;
        const south = region.latitude - region.latitudeDelta / 2;
        const north = region.latitude + region.latitudeDelta / 2;

        setBounds({ west, south, east, north });
        setZoom(Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2));
    };

    // Location Search (Geocoding)
    const handleLocationSearch = async () => {
        if (!locationSearchQuery) return;
        try {
            const result = await Location.geocodeAsync(locationSearchQuery);
            if (result.length > 0) {
                const { latitude, longitude } = result[0];
                setSearchLocationCoords({ latitude, longitude });
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }, 1000);
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        }
    };

    const reCenter = () => {
        if (userLocation && mapRef.current) {
            const { latitude, longitude } = userLocation.coords;
            setSearchLocationCoords({ latitude, longitude }); // Reset search center to user
            mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            });
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* FULL SCREEN MAP (Always rendered behind/toggled) */}
            <View className={`absolute inset-0 ${viewMode === 'map' ? 'z-0' : '-z-10 opacity-0'}`}>
                <MapView
                    ref={mapRef}
                    style={{ width: width, height: height }}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={mapRegion || {
                        latitude: 36.8065, longitude: 10.1815,
                        latitudeDelta: 0.1, longitudeDelta: 0.1
                    }}
                    onRegionChangeComplete={onRegionChangeComplete}
                    showsUserLocation={true}
                    showsMyLocationButton={false} // Custom button used
                >
                    {/* Render Clusters & Markers */}
                    {clusters.map((cluster) => {
                        const [longitude, latitude] = cluster.geometry.coordinates;
                        const { cluster: isCluster, point_count } = cluster.properties;

                        if (isCluster) {
                            return (
                                <Marker
                                    key={`cluster-${cluster.id}`}
                                    coordinate={{ latitude, longitude }}
                                    onPress={() => {
                                        const expansionZoom = index?.getClusterExpansionZoom(cluster.id);
                                        if (expansionZoom && mapRef.current) {
                                            mapRef.current.animateCamera({ center: { latitude, longitude }, zoom: expansionZoom });
                                        }
                                    }}
                                >
                                    <View className="bg-slate-900 border-2 border-white w-10 h-10 rounded-full items-center justify-center shadow-lg">
                                        <Text className="text-white font-bold text-xs">{point_count}</Text>
                                    </View>
                                </Marker>
                            );
                        }

                        // Individual Deal Marker
                        return (
                            <Marker
                                key={`deal-${cluster.properties.dealId}`}
                                coordinate={{ latitude, longitude }}
                                onPress={() => router.push({ pathname: '/deal/[id]', params: { id: cluster.properties.dealId } })}
                            >
                                <View className="items-center">
                                    <View className="bg-white p-1 rounded-full border border-slate-200 shadow-md w-10 h-10 items-center justify-center">
                                        <Image
                                            source={{ uri: cluster.properties.business?.logo || 'https://via.placeholder.com/40' }}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    </View>
                                    <View className="bg-slate-900 px-2 py-0.5 rounded-md mt-1">
                                        <Text className="text-white text-[8px] font-bold" numberOfLines={1}>
                                            {cluster.properties.business?.businessName?.substring(0, 10)}
                                        </Text>
                                    </View>
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                {/* Re-Center Button */}
                <TouchableOpacity
                    onPress={reCenter}
                    className="absolute bottom-32 right-6 bg-white w-12 h-12 rounded-full items-center justify-center shadow-xl border border-slate-100 z-10"
                >
                    <Ionicons name="navigate" size={20} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* List View Overlay */}
            {viewMode === 'list' && (
                <View className="flex-1 bg-slate-50 pt-32 pb-24">
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
                    ) : (
                        <FlatList
                            data={filteredDeals}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                            renderItem={({ item }) => <DealCard deal={item} />}
                            ListEmptyComponent={
                                <View className="items-center mt-10">
                                    <Text className="text-slate-400 font-bold">No deals found nearby.</Text>
                                    <Text className="text-slate-400 text-xs mt-1">Try increasing your search radius.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            )}

            {/* FLOATING HEADER (Search Bar) */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
                <View className="px-4 pt-2 pb-4">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
                            <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                        </TouchableOpacity>

                        <View className="flex-1 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex-row items-center px-4">
                            <Ionicons name="search" size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-2 font-bold text-slate-700"
                                placeholder={viewMode === 'list' ? "Search deals..." : "Search shops..."}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {/* Location Settings Button */}
                            <TouchableOpacity onPress={() => setLocationModalVisible(true)} className="flex-row items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full ml-2">
                                <FontAwesome5 name="map-marker-alt" size={12} color="#0f172a" />
                                <Text className="text-[10px] font-black text-slate-900">{maxDistance}km</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* FLOATING TOGGLE (Pill) */}
            <View className="absolute bottom-10 left-0 right-0 items-center z-50">
                <View className="flex-row bg-white p-1.5 rounded-full shadow-2xl border border-slate-100">
                    <TouchableOpacity
                        onPress={() => setViewMode('list')}
                        className={`px-6 py-3 rounded-full flex-row items-center gap-2 ${viewMode === 'list' ? 'bg-slate-900' : 'bg-transparent'}`}
                    >
                        <Ionicons name="list" size={16} color={viewMode === 'list' ? 'white' : '#64748b'} />
                        <Text className={`font-black text-xs ${viewMode === 'list' ? 'text-white' : 'text-slate-500'}`}>LIST</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewMode('map')}
                        className={`px-6 py-3 rounded-full flex-row items-center gap-2 ${viewMode === 'map' ? 'bg-slate-900' : 'bg-transparent'}`}
                    >
                        <FontAwesome5 name="map" size={14} color={viewMode === 'map' ? 'white' : '#64748b'} />
                        <Text className={`font-black text-xs ${viewMode === 'map' ? 'text-white' : 'text-slate-500'}`}>MAP</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* LOCATION SETTINGS MODAL */}
            <Modal visible={isLocationModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl h-[45%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black text-slate-900">Location Settings</Text>
                            <TouchableOpacity onPress={() => setLocationModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* City Search */}
                        <View className="mb-6">
                            <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Change Location</Text>
                            <View className="h-12 bg-slate-50 rounded-xl border border-slate-200 flex-row items-center px-4">
                                <Ionicons name="location-outline" size={18} color="#64748b" />
                                <TextInput
                                    className="flex-1 ml-2 font-bold text-slate-900"
                                    placeholder="Enter City or Address"
                                    value={locationSearchQuery}
                                    onChangeText={setLocationSearchQuery}
                                    onSubmitEditing={handleLocationSearch}
                                />
                                <TouchableOpacity onPress={handleLocationSearch}>
                                    <Text className="text-blue-600 font-bold text-xs">GO</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Distance Radius */}
                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xs font-bold text-slate-400 uppercase">Search Radius</Text>
                                <Text className="text-slate-900 font-black text-lg">{maxDistance} km</Text>
                            </View>

                            {/* Custom Distance Buttons */}
                            <View className="flex-row justify-between gap-3">
                                {[5, 10, 30, 50].map(dist => (
                                    <TouchableOpacity
                                        key={dist}
                                        onPress={() => setMaxDistance(dist)}
                                        className={`flex-1 py-3 rounded-xl items-center border ${maxDistance === dist ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Text className={`font-bold ${maxDistance === dist ? 'text-white' : 'text-slate-600'}`}>{dist}km</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Apply Button */}
                        <TouchableOpacity
                            onPress={() => setLocationModalVisible(false)}
                            className="bg-slate-900 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-black text-lg">Apply Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
