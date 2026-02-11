import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar, Keyboard, Alert, FlatList } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle, Callout } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { cleanMapStyle } from '../../constants/mapStyle';
import DealCard from '../../components/DealCard';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFilter } from '../../context/FilterContext';
import CustomMarker from '../../components/CustomMarker';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Map Error Boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="map-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorText}>Something went wrong with the map.</Text>
                    <TouchableOpacity onPress={() => this.setState({ hasError: false })} style={styles.retryBtn}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const { width, height } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = height * 0.45;

export default function MapScreen() {
    return (
        <ErrorBoundary>
            <MapScreenContent />
        </ErrorBoundary>
    );
}

function MapScreenContent() {
    // --- Context & State ---
    const {
        filterRadius, setFilterRadius,
        filterLocation, setFilterLocation,
        searchQuery, setSearchQuery
    } = useFilter();

    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [showDeals, setShowDeals] = useState(false);
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const mapRef = useRef<MapView>(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    // PERFORMANCE: Debounce search query to prevent filtering on every keystroke
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400); // 400ms debounce
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // --- Data Fetching ---
    const { data: businessesData, refetch, isRefetching } = useQuery({
        queryKey: ['map-businesses'],
        queryFn: async () => {
            const res = await api.get('/public/map-businesses');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const businesses = useMemo(() => businessesData?.businesses || [], [businessesData]);

    // --- Helpers ---
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    // --- Filtering Logic ---
    const filteredBusinesses = useMemo(() => {
        return businesses.filter((b: any) => {
            // 1. Text Search (Use debounced query)
            let matchesSearch = true;
            if (debouncedQuery) {
                const query = debouncedQuery.toLowerCase();
                matchesSearch = (
                    b.businessName.toLowerCase().includes(query) ||
                    (b.category && b.category.toLowerCase().includes(query)) ||
                    (b.deals && b.deals.some((d: any) => d.title.toLowerCase().includes(query)))
                );
            }

            // 2. Radius Filter
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
    }, [businesses, debouncedQuery, filterLocation, filterRadius]);

    // --- Camera & Zoom Logic (ULTRA-LIGHTWEIGHT - NO ANIMATIONS) ---
    const setMapRegion = useCallback((loc: { latitude: number, longitude: number }, radiusKm: number) => {
        if (!mapRef.current) return;

        // Calculate region WITHOUT animation for instant load
        const latDelta = (radiusKm * 2.4) / 111;
        const aspect = width / height;
        const lonDelta = latDelta * aspect;

        // Use setCamera for instant positioning (no animation)
        mapRef.current.setCamera({
            center: { latitude: loc.latitude, longitude: loc.longitude },
            zoom: 12,
        }, { duration: 0 }); // 0 duration = instant, no animation
    }, []);

    // REMOVED: Auto-zoom effect to prevent crashes
    // Map loads instantly at default zoom, no automatic camera movements

    // REMOVED: Auto-Handle Empty State effect to reduce processing
    // This was causing unnecessary re-renders and calculations

    // --- Effects ---

    // 1. Initial Location
    useEffect(() => {
        (async () => {
            if (!filterLocation) {
                handleUseCurrentLocation();
            }
        })();
    }, []);

    // 2. Watch Params (Open Filter)
    useEffect(() => {
        if (params.openFilter) setShowFilterSheet(true);
    }, [params.openFilter]);

    // --- Handlers ---

    const handleUseCurrentLocation = async () => {
        setIsLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') cancelLocation();

            let loc = await Location.getCurrentPositionAsync({});
            const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

            setFilterLocation(newLoc);
            // NO auto-zoom - let map load instantly
        } catch (error) {
            Alert.alert("Error", "Could not fetch location.");
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const cancelLocation = () => {
        setIsLoadingLocation(false);
        Alert.alert("Permission Required", "Please enable location to see deals near you.");
        router.back();
    }

    const handleCitySearch = async () => {
        if (!citySearch.trim()) return;
        Keyboard.dismiss();

        try {
            const geocoded = await Location.geocodeAsync(citySearch);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                const newLoc = { latitude, longitude };

                setFilterLocation(newLoc);
                setMapRegion(newLoc, filterRadius); // Fit to new city
                setCitySearch('');
            } else {
                Alert.alert("Not Found", "City not found.");
            }
        } catch (error) {
            Alert.alert("Error", "Geocoding failed.");
        }
    };

    const handleMarkerPress = useCallback((business: any) => {
        setSelectedBusiness(business);
        setShowDeals(true);
    }, []); // Stable callback

    // PERFORMANCE: Memoize cluster rendering
    const renderCluster = useCallback((cluster: any) => {
        const { id, geometry, properties } = cluster;
        const points = properties.point_count;
        return (
            <Marker
                key={`cluster-${id}`}
                coordinate={{ latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] }}
                tracksViewChanges={false} // CRITICAL: Prevent re-rendering static clusters
                tracksInfoWindowChanges={false}
            >
                <View className="bg-red-600 w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-md">
                    <Text className="text-white font-bold text-xs">{points}</Text>
                </View>
            </Marker>
        );
    }, []);

    // PERFORMANCE: Memoize map padding to prevent re-renders
    const mapPadding = useMemo(() => ({
        top: 80,
        bottom: showFilterSheet ? SHEET_MAX_HEIGHT - 20 : 20,
        left: 0,
        right: 0
    }), [showFilterSheet]);

    // --- Render ---

    if (!filterLocation && isLoadingLocation) {
        return (
            <View style={styles.centerContainer}>
                <View className='bg-white p-6 rounded-2xl items-center shadow-xl'>
                    <Ionicons name="navigate-circle" size={48} color="#E63946" className='animate-pulse' />
                    <Text className="text-slate-900 font-bold mt-4">Locating you...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* --- MAP LAYER (Z-index 0) --- */}
            {viewMode === 'map' && (
                <View style={StyleSheet.absoluteFill}>
                    <ClusteredMapView
                        ref={mapRef as any}
                        style={StyleSheet.absoluteFill}
                        provider={PROVIDER_GOOGLE}
                        customMapStyle={cleanMapStyle}

                        // Initial Region
                        initialRegion={{
                            latitude: filterLocation?.latitude || 46.2044,
                            longitude: filterLocation?.longitude || 6.1432,
                            latitudeDelta: 0.2, // Default Zoom
                            longitudeDelta: 0.2,
                        }}

                        // Interaction Settings
                        scrollEnabled={true}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}

                        // Padding to avoid UI covering markers (Filter Sheet)
                        mapPadding={mapPadding}

                        // Native User Location (Stable, prevents clustering)
                        showsUserLocation={true}
                        showsMyLocationButton={false} // We have our own button

                        // Performance: Optimization settings
                        extent={512} // Increase tile size for fewer clusters (better perf)
                        nodeSize={64} // Increase node size (default 64)
                        minPoints={3} // Only cluster if 3+ items
                        animationEnabled={false} // Disable cluster animations
                        preserveClusterPressBehavior={true} // Don't re-render on press

                        clusterColor="#E63946"
                        renderCluster={renderCluster}
                    >
                        {/* 1. Markers */}
                        {filteredBusinesses.map((business: any) => (
                            <CustomMarker
                                key={business.id}
                                business={business}
                                onSelect={handleMarkerPress} // Pass stable callback
                            />
                        ))}

                        {/* 2. Radius Circle (Geographic) */}
                        {filterLocation && (
                            <Circle
                                center={filterLocation}
                                radius={filterRadius * 1000} // Convert km to meters
                                strokeColor="rgba(230, 57, 70, 0.8)"
                                fillColor="rgba(230, 57, 70, 0.1)"
                                strokeWidth={2}
                                zIndex={1}
                            />
                        )}

                        {/* 3. User Location Marker REMOVED - Using native showsUserLocation instead */}
                    </ClusteredMapView>

                    {/* Empty State Banner (Floating) */}
                    {businesses.length > 0 && filteredBusinesses.length === 0 && (
                        <View className="absolute top-40 left-4 right-4 bg-slate-900/90 p-4 rounded-xl flex-row items-center justify-center gap-3 animate-in fade-in" pointerEvents="none">
                            <Ionicons name="search" size={20} color="#cbd5e1" />
                            <Text className="text-white font-bold text-sm">
                                No deals found in {filterRadius}km radius.
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* --- LIST VIEW --- */}
            {viewMode === 'list' && (
                <SafeAreaView style={styles.listContainer} edges={['bottom']}>
                    <FlatList
                        data={filteredBusinesses}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{
                            paddingTop: Platform.OS === 'ios' ? 140 : 130,
                            paddingHorizontal: 16,
                            paddingBottom: showFilterSheet ? SHEET_MAX_HEIGHT + 20 : 100
                        }}
                        renderItem={({ item: business }) => (
                            <TouchableOpacity
                                onPress={() => handleMarkerPress(business)}
                                className="bg-white rounded-2xl mb-4 overflow-hidden border border-slate-100 shadow-sm"
                            >
                                <View className="p-4">
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-1">
                                            <Text className="text-lg font-black text-slate-900 mb-1" numberOfLines={1}>
                                                {business.businessName}
                                            </Text>
                                            {business.category && (
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons name="pricetag" size={12} color="#64748b" />
                                                    <Text className="text-xs font-bold text-slate-500">
                                                        {business.category}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        {filterLocation && (
                                            <View className="bg-red-50 px-3 py-1 rounded-full">
                                                <Text className="text-xs font-black text-red-600">
                                                    {getDistanceFromLatLonInKm(
                                                        filterLocation.latitude,
                                                        filterLocation.longitude,
                                                        business.latitude,
                                                        business.longitude
                                                    ).toFixed(1)} km
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {business.deals && business.deals.length > 0 && (
                                        <View className="mt-3 pt-3 border-t border-slate-100">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="gift" size={14} color="#E63946" />
                                                <Text className="text-xs font-bold text-slate-600">
                                                    {business.deals.length} {business.deals.length === 1 ? 'Deal' : 'Deals'} Available
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-20">
                                <Ionicons name="search" size={48} color="#cbd5e1" />
                                <Text className="text-slate-400 font-bold mt-4 text-center">
                                    No businesses found in {filterRadius}km radius
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setFilterRadius(20);
                                        setSearchQuery('');
                                    }}
                                    className="mt-4 bg-slate-900 px-6 py-3 rounded-xl"
                                >
                                    <Text className="text-white font-bold">Reset Filters</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </SafeAreaView>
            )}


            {/* --- TOP UI LAYERS (Z-Index > 10) --- */}

            {/* 1. Search Bar */}
            <View style={styles.topBar} pointerEvents="box-none">
                <View className="flex-row gap-3">
                    <View className="flex-1 flex-row items-center bg-white h-12 rounded-full shadow-md px-4 border border-slate-100">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search deals (e.g. Burgers)" // Clarified placeholder
                            placeholderTextColor="#94a3b8"
                            className="flex-1 ml-3 font-bold text-slate-900"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={Keyboard.dismiss}
                        />
                    </View>
                    <TouchableOpacity
                        className={`w-12 h-12 rounded-full shadow-md items-center justify-center border border-slate-100 ${showFilterSheet ? 'bg-red-600' : 'bg-white'}`}
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowFilterSheet(prev => !prev);
                        }}
                    >
                        <Ionicons name="options" size={22} color={showFilterSheet ? "white" : "#1e293b"} />
                    </TouchableOpacity>
                </View>

                {/* View Toggles */}
                <View className="self-center mt-4 flex-row bg-white rounded-full p-1 shadow-sm border border-slate-100">
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

            {/* --- BOTTOM SHEET (Filter) --- */}
            {/* Using absolute positioning but ensuring it doesn't block map touches above it */}
            {showFilterSheet && (
                <View style={[styles.bottomSheet, { height: SHEET_MAX_HEIGHT }]}>
                    <View className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
                    <Text className="text-xl font-black text-slate-900 mb-4">Location & Radius</Text>

                    {/* City Search */}
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-slate-400 mb-2 uppercase">Jump to City</Text>
                        <View className="flex-row items-center bg-slate-100 h-12 rounded-xl px-4">
                            <Ionicons name="location-sharp" size={18} color="#64748b" />
                            <TextInput
                                placeholder="Enter city name..."
                                className="flex-1 ml-3 font-bold text-slate-900"
                                value={citySearch}
                                onChangeText={setCitySearch}
                                onSubmitEditing={handleCitySearch}
                                returnKeyType="search"
                            />
                            <TouchableOpacity onPress={handleCitySearch}>
                                <Ionicons name="arrow-forward-circle" size={28} color="#E63946" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Radius Slider */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-xs font-bold text-slate-400 uppercase">Distance Radius</Text>
                            <Text className="text-lg font-black text-red-600">{filterRadius.toFixed(0)} km</Text>
                        </View>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={50}
                            step={1}
                            value={filterRadius}
                            onValueChange={(val) => {
                                // Update visually instantly
                                setFilterRadius(val);
                            }}
                            onSlidingComplete={(val) => {
                                // Smart Zoom on release
                                if (filterLocation) setMapRegion(filterLocation, val);
                            }}
                            minimumTrackTintColor="#E63946"
                            maximumTrackTintColor="#e2e8f0"
                            thumbTintColor="#E63946"
                        />
                        <View className="flex-row justify-between px-1">
                            <Text className="text-xs text-slate-400">1km</Text>
                            <Text className="text-xs text-slate-400">50km</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleUseCurrentLocation}
                            className="flex-1 bg-slate-100 py-3 rounded-xl flex-row justify-center items-center gap-2"
                        >
                            <Ionicons name="navigate" size={16} color="#0f172a" />
                            <Text className="font-bold text-slate-900">Current Loc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowFilterSheet(false)}
                            className="flex-1 bg-slate-900 py-3 rounded-xl justify-center items-center"
                        >
                            <Text className="font-bold text-white">Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* --- RE-CENTER BUTTON (When Sheet Closed) --- */}
            {(!showFilterSheet && viewMode === 'map') && (
                <TouchableOpacity
                    onPress={() => {
                        if (filterLocation) setMapRegion(filterLocation, filterRadius);
                        else handleUseCurrentLocation();
                    }}
                    style={styles.fab}
                >
                    <Ionicons name="locate" size={24} color="#E63946" />
                </TouchableOpacity>
            )
            }

            {/* --- DEALS MODAL --- */}
            <Modal
                visible={showDeals}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDeals(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-[85%]">
                        <View className="flex-row items-center justify-between p-6 border-b border-slate-100">
                            <Text className="text-xl font-black text-slate-900 flex-1 mr-4" numberOfLines={1}>
                                {selectedBusiness?.businessName}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDeals(false)}
                                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-6">
                            {selectedBusiness?.deals.map((deal: any) => (
                                <View key={deal.id} className="mb-4">
                                    <DealCard deal={{ ...deal, business: selectedBusiness }} />
                                </View>
                            ))}
                            <View className="h-20" />
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
        backgroundColor: '#fff',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50,
        left: 20,
        right: 20,
        zIndex: 10, // Above Map
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 20, // Above Map
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600'
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#0f172a',
        borderRadius: 12,
    },
    retryBtnText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
