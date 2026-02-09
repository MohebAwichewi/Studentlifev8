import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Modal, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager, FlatList, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { cleanMapStyle } from '../../constants/mapStyle';
import DealCard from '../../components/DealCard';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFilter } from '../../context/FilterContext';
import { Image } from 'expo-image';
import CustomMarker from '../../components/CustomMarker';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';



if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
    // Context
    const {
        filterRadius, setFilterRadius,
        filterLocation, setFilterLocation,
        searchQuery, setSearchQuery
    } = useFilter();

    // Reanimated State for Zoom Level
    const currentDelta = useSharedValue(0.0922);

    // Local State
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map'); // 'map' or 'list'
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [showDeals, setShowDeals] = useState(false);
    const [showFilterSheet, setShowFilterSheet] = useState(false); // Default closed
    const [citySearch, setCitySearch] = useState('');
    const mapRef = useRef<MapView>(null);

    const router = useRouter();
    const params = useLocalSearchParams();

    // Handle Params from Home
    useEffect(() => {
        if (params.openFilter) {
            setShowFilterSheet(true);
        }
    }, [params.openFilter]);

    // Fetch businesses
    const { data: businessesData, refetch, isRefetching } = useQuery({
        queryKey: ['map-businesses'],
        queryFn: async () => {
            const res = await api.get('/public/map-businesses');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Haversine Algo for Client-Side Filtering
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180)
    }

    const businesses = businessesData?.businesses || [];

    // Filter businesses by Product Search (searchQuery) AND Radius
    const filteredBusinesses = businesses.filter((b: any) => {
        // 1. Text Search Filter
        let matchesSearch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch = (
                b.businessName.toLowerCase().includes(query) ||
                (b.category && b.category.toLowerCase().includes(query)) ||
                (b.deals && b.deals.some((d: any) => d.title.toLowerCase().includes(query) || d.category.toLowerCase().includes(query)))
            );
        }

        // 2. Strict Radius Filter
        let matchesRadius = true;
        if (filterLocation && filterRadius) {
            const dist = getDistanceFromLatLonInKm(
                filterLocation.latitude,
                filterLocation.longitude,
                b.latitude,
                b.longitude
            );
            matchesRadius = dist <= filterRadius;
        }

        return matchesSearch && matchesRadius;
    });

    // Sync Map Center with Context (One-time init or on Update)
    useEffect(() => {
        (async () => {
            // Only if not set, find location
            if (!filterLocation) {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        // START: No Default City Logic
                        setFilterLocation(null); // Explicitly null
                        return; // Stop execution
                    }
                    let loc = await Location.getCurrentPositionAsync({});
                    const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setFilterLocation(newLoc);
                    animateToLocation(newLoc);
                } catch (error) {

                    // Do NOT set fallback. 
                    // UI will show "Locating..." or we can add a specific error state.
                }
            }
        })();
    }, []);

    const animateToLocation = (loc: { latitude: number, longitude: number }) => {
        mapRef.current?.animateToRegion({
            latitude: loc.latitude,
            longitude: loc.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }, 1000);
    }

    const handleUseCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let loc = await Location.getCurrentPositionAsync({});
            const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setFilterLocation(newLoc);
            animateToLocation(newLoc);
        } catch (error) {
            alert("Could not fetch location. Please check your settings.");
        }
    }

    const handleReCenter = async () => {
        try {
            let loc = await Location.getCurrentPositionAsync({});
            const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            animateToLocation(newLoc);
        } catch (error) {
            alert("Could not fetch location.");
        }
    }

    const handleMarkerPress = (business: any) => {
        setSelectedBusiness(business);
        setShowDeals(true);
    };

    // Main Search (Products) - No longer geocodes
    const handleProductSearch = () => {
        // Just dismiss keyboard, filtering is reactive
        // optional: show toast "Searching for {searchQuery}..."
    };

    // City Search (Location) - Moves Map
    const handleCitySearch = async () => {
        if (!citySearch.trim()) return;

        try {
            const geocoded = await Location.geocodeAsync(citySearch);

            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                const newLoc = { latitude, longitude };

                setFilterLocation(newLoc);
                animateToLocation(newLoc);
                setCitySearch(''); // Clear after moving
                // Optional: Close sheet? Keep open? User said "Controls live here", safest to keep open or let user close.
            } else {
                alert("Location not found");
            }
        } catch (error) {

            alert("Could not find location");
        }
    };



    // Cluster Rendering
    const renderCluster = (cluster: any) => {
        const { id, geometry, onPress, properties } = cluster;
        const points = properties.point_count;

        return (
            <Marker
                key={`cluster-${id}`}
                coordinate={{
                    latitude: geometry.coordinates[1],
                    longitude: geometry.coordinates[0],
                }}
                onPress={onPress}
                tracksViewChanges={false}
            >
                <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-sm">
                    <Text className="text-white font-bold text-xs">{points}</Text>
                </View>
            </Marker>
        );
    };

    if (!filterLocation) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-8">
                <Ionicons name="location-outline" size={64} color="#E63946" />
                <Text className="text-xl font-black text-slate-900 mt-6 text-center">Location Required</Text>
                <Text className="text-slate-500 text-center mt-2 mb-8">
                    We do not use default locations. To find the best student deals near you, we need your real GPS location.
                </Text>
                <TouchableOpacity
                    onPress={handleUseCurrentLocation}
                    className="bg-primary px-8 py-3 rounded-full flex-row items-center gap-2"
                >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text className="text-white font-bold">Enable Location</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const SHEET_HEIGHT = height * 0.45;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <ClusteredMapView
                ref={mapRef as any}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={cleanMapStyle}
                initialRegion={{
                    latitude: filterLocation?.latitude || 46.2044,
                    longitude: filterLocation?.longitude || 6.1432,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                mapPadding={{
                    top: 0,
                    right: 0,
                    bottom: showFilterSheet ? SHEET_HEIGHT : 0,
                    left: 0
                }}
                // Update location when user drags map (ONLY if filter sheet is open)
                // Note: We use onRegionChangeComplete to prevent jitter
                onRegionChangeComplete={(region) => {
                    if (showFilterSheet) {
                        setFilterLocation({
                            latitude: region.latitude,
                            longitude: region.longitude
                        });
                    }
                }}
                showsUserLocation={true}
                showsMyLocationButton={false} // Custom button used
                clusterColor="#E63946" // Red (User Request)
                renderCluster={renderCluster}
                animationEnabled={false} // Reduce jitter on padding change
            >
                {filteredBusinesses.map((business: any) => (
                    <CustomMarker
                        key={business.id}
                        business={business}
                        onPress={() => handleMarkerPress(business)}
                    />
                ))}

                {/* RADIUS CIRCLE (Native Map Component) */}
                {showFilterSheet && filterLocation && (
                    <Circle
                        center={filterLocation}
                        radius={filterRadius * 1000} // km to meters
                        strokeColor="rgba(230, 57, 70, 0.8)" // Red border
                        fillColor="rgba(230, 57, 70, 0.15)" // Light red fill
                        strokeWidth={2}
                        zIndex={100} // Ensure it's above tiles but below markers?
                    />
                )}
            </ClusteredMapView>

            {/* FIXED CENTER CROSSHAIR (Only visual guide) */}
            {showFilterSheet && (
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            zIndex: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: SHEET_HEIGHT, // Center matches map padding
                        }
                    ]}
                >
                    {/* Center Crosshair */}
                    <Ionicons name="add" size={32} color="#E63946" />
                </View>
            )}
        </View>
    )
}

{/* 1b. LIST VIEW */ }
{
    viewMode === 'list' && (
        <View className="flex-1 bg-slate-50 pt-32 px-4">
            {/* Fallback Logic Calculation */}
            {(() => {
                const isFallback = filteredBusinesses.length === 0 && businesses.length > 0;
                let displayList = filteredBusinesses;

                if (isFallback && filterLocation) {
                    // Find closest businesses from ALL businesses
                    displayList = businesses
                        .map((b: any) => ({
                            ...b,
                            dist: getDistanceFromLatLonInKm(
                                filterLocation.latitude, filterLocation.longitude,
                                b.latitude, b.longitude
                            )
                        }))
                        .sort((a: any, b: any) => a.dist - b.dist)
                        .slice(0, 10); // Top 10 closest
                }

                return (
                    <>
                        {isFallback && (
                            <View className="mb-4 bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                <Text className="text-orange-800 font-bold text-center">
                                    No offers found in this exact location. Here are the closest offers to you:
                                </Text>
                            </View>
                        )}

                        <FlatList
                            data={displayList}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            renderItem={({ item }) => (
                                <View className="mb-4">
                                    {item.deals && item.deals.length > 0 ? (
                                        <DealCard deal={{ ...item.deals[0], business: item }} userLocation={filterLocation} />
                                    ) : (
                                        <View className="bg-white p-4 rounded-xl">
                                            <Text className="font-bold text-lg">{item.businessName}</Text>
                                            <Text className="text-slate-500">No active deals</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text className="text-center text-slate-500 mt-10">No businesses found matching "{searchQuery}"</Text>
                            }
                        />
                    </>
                );
            })()}
        </View>
    )
}

{/* 2. FLOATING SEARCH BAR (Top) - Products Only */ }
<View className="absolute top-12 left-5 right-5 z-20 flex-row gap-3">
    <View className="flex-1 flex-row items-center bg-white h-12 rounded-full shadow-lg shadow-black/10 px-4 border border-slate-100">
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
            placeholder="Search shops or products..." // Updated placeholder
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-3 font-bold text-slate-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleProductSearch} // No more geocode
            style={{ height: '100%' }}
        />
    </View>
    <TouchableOpacity
        className={`w-12 h-12 rounded-full shadow-lg shadow-black/10 items-center justify-center border border-slate-100 ${showFilterSheet ? 'bg-red-500 border-red-500' : 'bg-white'}`}
        onPress={() => {
            require('react-native').Keyboard.dismiss();
            setShowFilterSheet(prev => !prev);
        }}
    >
        <Ionicons name="options" size={20} color={showFilterSheet ? "white" : "#9B2226"} />
    </TouchableOpacity>
</View>

{/* 3. LIST / MAP TOGGLE (Top Center, below search) */ }
<View className="absolute top-28 w-full items-center z-20">
    <View className="flex-row bg-white rounded-full p-1 shadow-lg shadow-black/10 border border-slate-100">
        <TouchableOpacity
            onPress={() => setViewMode('map')}
            className={`px-6 py-2 rounded-full ${viewMode === 'map' ? 'bg-slate-900' : 'bg-transparent'}`}
        >
            <Text className={`font-bold ${viewMode === 'map' ? 'text-white' : 'text-slate-500'}`}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`px-6 py-2 rounded-full ${viewMode === 'list' ? 'bg-slate-900' : 'bg-transparent'}`}
        >
            <Text className={`font-bold ${viewMode === 'list' ? 'text-white' : 'text-slate-500'}`}>List</Text>
        </TouchableOpacity>
    </View>
</View>

{/* 4. RE-CENTER BUTTON (Bottom Right) - Only in Map Mode */ }
{
    viewMode === 'map' && (
        <TouchableOpacity
            onPress={handleReCenter}
            className="absolute bottom-8 right-5 w-14 h-14 bg-white rounded-full shadow-xl shadow-black/20 items-center justify-center z-10"
        >
            <Ionicons name="locate" size={28} color="#9B2226" />
        </TouchableOpacity>
    )
}

{/* 5. FILTER SHEET (Location Settings) */ }
{
    showFilterSheet && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-10 z-30 animate-in slide-in-from-bottom-10">
            <View className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

            <Text className="text-xl font-black text-slate-900 mb-4">Location Settings</Text>

            {/* CITY SEARCH INPUT (Location Only) */}
            <View className="mb-6">
                <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Change Location</Text>
                <View className="flex-row items-center bg-slate-100 h-12 rounded-xl px-4 border border-slate-200">
                    <Ionicons name="location-sharp" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Enter city (e.g. London)..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-3 font-bold text-slate-900"
                        value={citySearch}
                        onChangeText={setCitySearch}
                        returnKeyType="search"
                        onSubmitEditing={handleCitySearch}
                        style={{ height: '100%' }}
                    />
                    {citySearch.length > 0 && (
                        <TouchableOpacity onPress={handleCitySearch} className="bg-red-500 p-1.5 rounded-full">
                            <Ionicons name="arrow-forward" size={16} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* RADIUS SLIDER (Only here) */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm font-bold text-slate-500 uppercase tracking-wide">Search Radius</Text>
                    <Text className="text-lg font-black text-red-600">{filterRadius.toFixed(0)} km</Text>
                </View>

                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={1}
                    maximumValue={30}
                    step={1}
                    value={filterRadius}
                    onValueChange={(val) => {
                        setFilterRadius(val);
                        // Zoom map to fit radius
                        // 1 degree lat ~ 111km
                        // newDelta should cover diameter (2 * radius) with padding
                        const newDelta = (val * 2 * 1.3) / 111;
                        mapRef.current?.animateToRegion({
                            latitude: filterLocation?.latitude || 46.2044,
                            longitude: filterLocation?.longitude || 6.1432,
                            latitudeDelta: newDelta,
                            longitudeDelta: newDelta * 0.5,
                        }, 500);
                    }}
                    minimumTrackTintColor="#E63946"
                    maximumTrackTintColor="#e2e8f0"
                    thumbTintColor="#E63946"
                />
                <View className="flex-row justify-between mt-1">
                    <Text className="text-xs font-bold text-slate-400">1 km</Text>
                    <Text className="text-xs font-bold text-slate-400">30 km</Text>
                </View>
            </View>

            {/* USE GPS BUTTON */}
            <TouchableOpacity
                onPress={() => {
                    handleUseCurrentLocation();
                }}
                className="flex-row items-center justify-center gap-2 mb-6 py-3 bg-slate-50 rounded-xl border border-slate-200"
            >
                <Ionicons name="navigate" size={18} color="#E63946" />
                <Text className="text-slate-900 font-bold">Use my current location</Text>
            </TouchableOpacity>

            {/* APPLY BUTTON */}
            <TouchableOpacity
                onPress={() => {
                    setShowFilterSheet(false);
                    // No need to clear params manually as we use unique timestamps now

                    if (params.returnToHome === 'true') {
                        router.back();
                    }
                }}
                className="w-full bg-slate-900 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-black/20"
            >
                <Text className="text-white font-bold text-lg">Apply Settings</Text>
            </TouchableOpacity>
        </View >
    )

    {/* DEALS MODAL (On Marker Press) */ }
    <Modal
        visible={showDeals}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeals(false)}
    >
        <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl max-h-[80%]">
                {/* Header */}
                <View className="flex-row items-center justify-between p-6 border-b border-slate-100">
                    <View className="flex-1">
                        <Text className="text-2xl font-black text-slate-900">
                            {selectedBusiness?.businessName}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowDeals(false)}
                        className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
                    >
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Deals List */}
                <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                    {selectedBusiness?.deals.map((deal: any) => (
                        <View key={deal.id} className="mb-4">
                            <DealCard
                                deal={{
                                    ...deal,
                                    business: selectedBusiness
                                }}
                                userLocation={filterLocation}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
