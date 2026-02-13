import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Supercluster from 'supercluster';
import { useNavigation, useRouter } from 'expo-router';
import MapPreviewCard from '../../components/MapPreviewCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import haversine from 'haversine';

const { width, height } = Dimensions.get('window');

// TUNISIA BOUNDS (Approx)
const TUNISIA_REGION = {
    latitude: 34.0, // Center-ish
    longitude: 9.5,
    latitudeDelta: 5.0, // Zoomed out enough to see whole country
    longitudeDelta: 5.0,
};

// Map Style to hide POIs
const CUSTOM_MAP_STYLE = [
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "stylers": [{ "visibility": "off" }]
    }
];

const CATEGORY_COLORS: Record<string, string> = {
    'eat_drink': '#fb923c', // Orange
    'wellness': '#86efac', // Green
    'retail': '#60a5fa', // Blue
    'services': '#cbd5e1', // Slate
    'entertainment': '#c084fc', // Purple
    'fitness': '#fdba74', // Orange-light
    'default': '#94a3b8'
};

export default function MapScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);

    // States
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Clustering
    const [zoom, setZoom] = useState(10);
    const [bounds, setBounds] = useState<any>(null);
    const [region, setRegion] = useState<Region>({
        latitude: 36.8065, longitude: 10.1815, // Default Tunis
        latitudeDelta: 0.05, longitudeDelta: 0.05
    });

    // Toggle Full Screen (Hide Tab Bar)
    useEffect(() => {
        navigation.setOptions({
            tabBarStyle: {
                display: isFullScreen ? 'none' : 'flex',
                backgroundColor: '#ffffff',
                borderTopWidth: 0,
                elevation: 0,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            }
        });
    }, [isFullScreen]);

    // Get User Location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            // Animate to user on load
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                }, 1000);
            }
        })();
    }, []);

    // Fetch Deals
    const { data: deals } = useQuery({
        queryKey: ['map-deals'],
        queryFn: async () => {
            const res = await api.get('/public/deals');
            return (res.data && Array.isArray(res.data.deals)) ? res.data.deals : [];
        }
    });

    // Supercluster Setup
    const index = useMemo(() => {
        const idx = new Supercluster({
            radius: 40,
            maxZoom: 16,
        });
        if (deals) {
            const points = deals.map((d: any) => ({
                type: 'Feature',
                properties: { cluster: false, dealId: d.id, ...d },
                geometry: {
                    type: 'Point',
                    coordinates: [d.business.longitude, d.business.latitude],
                },
            }));
            idx.load(points);
        }
        return idx;
    }, [deals]);

    const clusters = useMemo(() => {
        if (!bounds || !index) return [];
        return index.getClusters([bounds.west, bounds.south, bounds.east, bounds.north], zoom);
    }, [bounds, zoom, index]);

    const onRegionChangeComplete = (reg: Region) => {
        setRegion(reg);
        // Calculate BBox
        const west = reg.longitude - reg.longitudeDelta / 2;
        const east = reg.longitude + reg.longitudeDelta / 2;
        const south = reg.latitude - reg.latitudeDelta / 2;
        const north = reg.latitude + reg.latitudeDelta / 2;

        setBounds({ west, south, east, north });
        setZoom(Math.round(Math.log(360 / reg.longitudeDelta) / Math.LN2));
    };

    const handleCenterOnMe = async () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            });
        }
    };

    const getPinColor = (cat: string) => {
        // Simple normalization
        const key = Object.keys(CATEGORY_COLORS).find(k => cat?.toLowerCase().includes(k.replace('_', ' ')));
        return key ? CATEGORY_COLORS[key] : CATEGORY_COLORS['default'];
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={CUSTOM_MAP_STYLE}
                initialRegion={region}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
                minZoomLevel={6} // Restrict zoom out (Country level)
                maxZoomLevel={20}
                rotateEnabled={false} // Keep North up for cleanliness
            >
                {/* 5km Radius Circle around User */}
                {location && (
                    <Circle
                        center={location.coords}
                        radius={5000} // 5km
                        fillColor="rgba(59, 130, 246, 0.1)" // Blue transparent
                        strokeColor="rgba(59, 130, 246, 0.3)"
                        zIndex={1}
                    />
                )}

                {/* Clusters & Markers */}
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
                                zIndex={2}
                            >
                                <View className="bg-slate-900 border-2 border-white w-10 h-10 rounded-full items-center justify-center shadow-lg">
                                    <Text className="text-white font-bold text-xs">{point_count}</Text>
                                </View>
                            </Marker>
                        );
                    }

                    // Individual Marker
                    const deal = cluster.properties;
                    const isNew = false; // Mock logic for now

                    return (
                        <Marker
                            key={`deal-${deal.dealId}`}
                            coordinate={{ latitude, longitude }}
                            onPress={() => {
                                // Calculate distance if user loc exists
                                let dist = 0;
                                if (location) {
                                    dist = haversine(location.coords, { latitude, longitude }, { unit: 'km' });
                                }
                                setSelectedDeal({ ...deal, distance: dist });
                            }}
                            zIndex={3}
                        >
                            <View className="items-center">
                                {/* Pin */}
                                <View
                                    className="p-1 rounded-full border-2 border-white shadow-md w-10 h-10 items-center justify-center relative"
                                    style={{ backgroundColor: getPinColor(deal.category || '') }}
                                >
                                    <FontAwesome5 name="store" size={14} color="white" />

                                    {/* Pulse Indicator for New/Hot */}
                                    {isNew && (
                                        <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white z-10" />
                                    )}
                                </View>
                                {/* Triangle pointer */}
                                <View
                                    className="w-0 h-0 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent shadow-sm"
                                    style={{ borderTopColor: getPinColor(deal.category || '') }}
                                />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Controls */}
            <SafeAreaView className="absolute top-4 right-4 gap-3">
                {/* Full Screen Toggle */}
                <TouchableOpacity
                    onPress={() => setIsFullScreen(!isFullScreen)}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-slate-100"
                >
                    <Ionicons name={isFullScreen ? "contract" : "expand"} size={22} color="#0f172a" />
                </TouchableOpacity>

                {/* Center Me */}
                <TouchableOpacity
                    onPress={handleCenterOnMe}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-slate-100"
                >
                    <Ionicons name="locate" size={22} color="#2563eb" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Deal Preview */}
            {selectedDeal && (
                <MapPreviewCard
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: '100%',
    },
});
