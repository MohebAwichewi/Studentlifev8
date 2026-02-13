<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Alert, Share, Linking, Platform, Dimensions, FlatList, ActionSheetIOS } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import CheckoutModal from '../../components/CheckoutModal';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import DealCard from '../../components/DealCard';

import * as Location from 'expo-location';
import haversine from 'haversine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Mock for similar deals until API is ready
const KEYWORDS_TO_MATCH = ["pizza", "burger", "spa", "gym", "coffee"];

export default function DealDetails() {
    const { id, action } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [redeeming, setRedeeming] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    // Auto-open Checkout if requested
    useEffect(() => {
        if (action === 'checkout') {
            setTimeout(() => setModalVisible(true), 500);
        }
    }, [action]);

    // Check if saved on load
    useEffect(() => {
        const checkSaved = async () => {
            if (!user?.id || !deal?.id) return;
            try {
                const res = await api.get(`/auth/user/saved-deals?userId=${user.id}`);
                if (res.data.success) {
                    const isSaved = res.data.deals.some((d: any) => d.id === parseInt(id as string));
                    setSaved(isSaved);
                }
            } catch (e) {
                console.log("Error checking saved status", e);
            }
        };
        checkSaved();
    }, [user, deal]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to save deals.");
            return;
        }
        setSaving(true);
        // Optimistic update
        const previous = saved;
        setSaved(!saved);

        try {
            const res = await api.post('/auth/user/save-deal', {
                userId: user.id,
                dealId: id
            });
            if (res.data.success) {
                setSaved(res.data.saved);
            } else {
                setSaved(previous); // Revert
            }
        } catch (error) {
            console.error(error);
            setSaved(previous); // Revert
        } finally {
            setSaving(false);
        }
    };
=======
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeToRedeem from '../../components/SwipeToRedeem';
import Modal from '../../components/Modal';
import * as Location from 'expo-location';
import haversine from 'haversine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function DealDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [redeeming, setRedeeming] = useState(false);
    const [liveDistance, setLiveDistance] = useState<number | null>(null);
    const [isNearby, setIsNearby] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemedAt, setRedeemedAt] = useState<Date | null>(null);
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

    const { data: deal, isLoading, error } = useQuery({
        queryKey: ['deal', id],
        queryFn: async () => {
<<<<<<< HEAD
            try {
                const res = await api.get(`/public/deals/${id}`);
                if (res.data && res.data.deal) {
                    return res.data.deal;
                }
                return res.data;
            } catch (e) {
                console.log("Single deal fetch failed, falling back to list...", e);
                const res = await api.get('/public/deals');
                const allDeals = (res.data && Array.isArray(res.data.deals)) ? res.data.deals : (Array.isArray(res.data) ? res.data : []);
                const found = allDeals.find((d: any) => d.id.toString() === id?.toString());
                if (!found) throw new Error('Deal not found');
                return found;
            }
=======
            console.log("Fetching deal with ID:", id); // LOG
            if (!id) throw new Error("No ID provided");

            // ✅ Use the new dedicated endpoint
            const res = await api.get(`/public/deals/${id}`);
            console.log("Deal Fetch Response:", res.data); // LOG

            if (res.data && res.data.deal) {
                return res.data.deal;
            }
            throw new Error('Deal not found');
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        },
        enabled: !!id
    });

<<<<<<< HEAD
    // Fetch Similar Deals (Client-side filtering for now)
    const { data: similarDeals } = useQuery({
        queryKey: ['similarDeals', deal?.category],
        enabled: !!deal,
        queryFn: async () => {
            const res = await api.get('/public/deals');
            const all = res.data.deals || [];
            // Filter by category, exclude current deal
            return all.filter((d: any) => d.category === deal.category && d.id !== deal.id).slice(0, 5);
        }
    });

    const onShare = async () => {
        try {
            await Share.share({
                message: `Check out this deal: ${deal.title} at ${deal.business.businessName}! Get it on WIN App.`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${deal.business.latitude},${deal.business.longitude}`;
        const label = deal.business.businessName;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) Linking.openURL(url);
    };

    const handleContact = () => {
        const options = ['Call Business', 'Cancel'];
        const cancelButtonIndex = 1;
        const phone = deal.business.phone;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        if (phone) Linking.openURL(`tel:${phone}`);
                        else Alert.alert("No Phone", "Number not available.");
                    }
                }
            );
        } else {
            // Android simple alert or custom modal
            Alert.alert(
                "Contact Business",
                `Call ${deal.business.businessName}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Call", onPress: () => phone ? Linking.openURL(`tel:${phone}`) : Alert.alert("No Phone") }
                ]
            );
        }
    };

    const handleRedeem = async (quantity: number, paymentMethod: string) => {
=======
    // Check Distance on Mount/Interval
    useEffect(() => {
        if (!deal?.business?.latitude || !deal?.business?.longitude) return;

        let locationSubscription: any;

        const startLocationTracking = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                // One-time check initially
                const loc = await Location.getCurrentPositionAsync({});
                updateDistance(loc.coords);

                // Optional: Watch position for live updates
                locationSubscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
                    (newLoc) => updateDistance(newLoc.coords)
                );
            } catch (e) {

            }
        };

        const updateDistance = (coords: any) => {
            if (!deal?.business) return;

            const userLoc = { latitude: coords.latitude, longitude: coords.longitude };
            const businessLoc = { latitude: deal.business.latitude, longitude: deal.business.longitude };

            const dist = haversine(userLoc, businessLoc, { unit: 'meter' });
            setLiveDistance(dist);
            setIsNearby(dist <= 200); // 200 meters threshold
        };

        startLocationTracking();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, [deal]);

    // Handle Cooldown Timer
    useEffect(() => {
        let interval: any;

        // Initial Check
        AsyncStorage.getItem(`last_redeem_${id}`).then((lastRedeem) => {
            if (lastRedeem) {
                const diff = Date.now() - parseInt(lastRedeem);
                const cooldownDuration = 5 * 60 * 1000; // 5 minutes
                if (diff < cooldownDuration) {
                    setCooldownSeconds(Math.ceil((cooldownDuration - diff) / 1000));
                }
            }
        });

        if (cooldownSeconds > 0) {
            interval = setInterval(() => {
                setCooldownSeconds((prev) => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [cooldownSeconds, id]);

    // Format Seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleRedeem = async () => {
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        if (!deal) return;
        setRedeeming(true);

        try {
            // 1. Check Cooldown
            const lastRedeem = await AsyncStorage.getItem(`last_redeem_${id}`);
            if (lastRedeem) {
                const diff = Date.now() - parseInt(lastRedeem);
<<<<<<< HEAD
                const cooldown = 12 * 60 * 60 * 1000; // 12 hours check (adjust as needed)
                if (diff < cooldown && !deal.isMultiUse) {
                    Alert.alert("Already Redeemed", "You have already used this deal recently.");
                    setRedeeming(false);
                    setModalVisible(false); // Close Modal
=======
                const cooldown = 5 * 60 * 1000; // 5 minutes
                if (diff < cooldown) {
                    const remaining = Math.ceil((cooldown - diff) / 60000);
                    showNotification('warning', "Cooldown Active", `Please wait ${remaining} minutes before redeeming again.`);
                    setRedeeming(false);
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                    return;
                }
            }

            // 2. Check Permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
<<<<<<< HEAD
                Alert.alert("Permission Denied", "We need location access to verify you are in-store.");
=======
                showNotification('error', "Permission Denied", "We need location access to verify you are in-store.");
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                setRedeeming(false);
                return;
            }

            // 3. Get Location
            const location = await Location.getCurrentPositionAsync({});

            // 4. Calculate Distance
            const userLoc = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            const businessLoc = { latitude: deal.business.latitude, longitude: deal.business.longitude };

<<<<<<< HEAD
            if (businessLoc.latitude && businessLoc.longitude) {
                const distance = haversine(userLoc, businessLoc, { unit: 'meter' });
                // 500 meters tolerance
                if (distance > 500) {
                    Alert.alert("Too Far", `You are ${Math.round(distance)}m away. You must be at the store to redeem.`);
                    setRedeeming(false);
                    return;
                }
            } else {
                Alert.alert("Location Error", "Business location not set.");
                setRedeeming(false);
                return;
            }

            // 5. Success! Call Backend to Claim & Generate Ticket
            await AsyncStorage.setItem(`last_redeem_${id}`, Date.now().toString());

            const res = await api.post('/auth/user/claim-deal', {
                email: user?.email,
                dealId: id,
                quantity: quantity,
                paymentMethod: paymentMethod
            });

            if (!res.data.success) throw new Error(res.data.error || "Claim failed");

            setRedeeming(false);
            setModalVisible(false); // Close Modal

            // Navigate to Ticket Screen with Unique Code
            router.push({
                pathname: '/redeem-success',
                params: {
                    dealTitle: res.data.dealTitle || deal.title,
                    businessName: res.data.businessName || deal.business.businessName,
                    code: res.data.code,
                    quantity: quantity,
                    totalPrice: (deal.discountedPrice || 0) * quantity
                }
            });

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "Could not verify location or redemption failed. Try again.";
            Alert.alert("Redemption Failed", msg);
=======
            // If business has no location set, skip check (or block, depending on strictness)
            if (businessLoc.latitude && businessLoc.longitude) {
                const distance = haversine(userLoc, businessLoc, { unit: 'meter' });
                if (distance > 200) { // 200 meters allowed
                    showNotification('warning', "Too Far", `You are ${Math.round(distance)}m away. You must be in-store to redeem.`);
                    setRedeeming(false);
                    return;
                }
            }

            // 5. Success!
            await AsyncStorage.setItem(`last_redeem_${id}`, Date.now().toString());

            // Silent Backend Sync
            if (user?.email) {
                // Use the correct endpoint for swipe redemption
                api.post('/auth/student/redeem-swipe', {
                    email: user.email,
                    dealId: id,
                    userLat: location.coords.latitude,
                    userLng: location.coords.longitude
                }).then(res => {
                    console.log("Redemption Sync Success:", res.data);
                }).catch(err => {
                    console.error("Redemption Sync Failed:", err.response?.data || err.message);
                    // Optionally show error if strict
                });
            } else {
                console.warn("User email missing for redemption sync");
            }

            setRedeeming(false);
            setCooldownSeconds(300); // Start 5 min timer immediately
            setRedeemedAt(new Date()); // ✅ Track redemption time
            showNotification('success', "Success!", "Offer redeemed successfully.");

            // Removed Navigation to Success Screen
        } catch (error: any) {

            const msg = error.response?.data?.error || "Could not verify location or redemption failed. Try again.";
            showNotification('error', "Redemption Failed", msg);
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            setRedeeming(false);
        }
    };

<<<<<<< HEAD
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
=======
    const openMap = () => {
        if (!deal?.business?.address) return;

        const address = encodeURIComponent(deal.business.address);
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${deal.business.latitude},${deal.business.longitude}`;
        const label = encodeURIComponent(deal.business.businessName);

        // Try to use coordinates if available, otherwise just query
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`
        });

        // Fallback to simple address search if coordinates missing
        const fallbackUrl = Platform.select({
            ios: `http://maps.apple.com/?q=${address}`,
            android: `geo:0,0?q=${address}`
        });

        const finalUrl = (deal.business.latitude && deal.business.longitude) ? url : fallbackUrl;

        Linking.openURL(finalUrl!);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0f172a" />
            </SafeAreaView>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        );
    }

    if (error || !deal) {
        return (
<<<<<<< HEAD
            <View className="flex-1 justify-center items-center bg-white px-6">
=======
            <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                <FontAwesome5 name="exclamation-circle" size={48} color="#ef4444" />
                <Text className="text-slate-900 font-bold text-xl mt-4">Oops!</Text>
                <Text className="text-slate-500 text-center mt-2 mb-6">We couldn't load this deal. It might have expired or been removed.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-slate-900 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
<<<<<<< HEAD
            </View>
        );
    }

    // Prepare images for carousel (mock if only single)
    const images = deal.images || [deal.image || deal.business?.coverImage || 'https://via.placeholder.com/400'];

    // Countdown Logic (Basic display)
    const expiryDate = deal.expiryDate ? new Date(deal.expiryDate).toLocaleDateString() : 'N/A';
    const inventoryLeft = deal.inventory ? deal.inventory : 999;
    const isLowStock = inventoryLeft < 10;

=======
            </SafeAreaView>
        );
    }

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

<<<<<<< HEAD
            {/* Sticky Header Actions */}
            <SafeAreaView className="absolute top-0 left-0 w-full z-20 flex-row justify-between px-6 pointer-events-none">
                <View className="pointer-events-auto">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
                    >
                        <FontAwesome5 name="arrow-left" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-3 pointer-events-auto">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
                    >
                        <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? "#ef4444" : "white"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onShare}
                        className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
                    >
                        <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero Carousel */}
                <View className="h-[50vh] w-full relative bg-slate-900">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={({ nativeEvent }) => {
                            const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
                            if (slide !== activeSlide) setActiveSlide(slide);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                className="w-full h-full opacity-90"
                                style={{ width }}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                    <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0 pointer-events-none" />

                    {/* Pagination Dots */}
                    {images.length > 1 && (
                        <View className="absolute bottom-32 left-0 right-0 flex-row justify-center gap-2">
                            {images.map((_: any, i: number) => (
                                <View key={i} className={`w-2 h-2 rounded-full ${i === activeSlide ? 'bg-white' : 'bg-white/40'}`} />
                            ))}
                        </View>
                    )}

                    {/* Shop Header Overlay */}
                    <View className="absolute bottom-8 left-6 right-6">
                        <View className="flex-row items-end gap-4">
                            <Image
                                source={{ uri: deal.business?.logo || 'https://via.placeholder.com/50' }}
                                className="w-16 h-16 rounded-2xl bg-white border-2 border-white"
                            />
                            <View className="mb-1 flex-1">
                                <Text className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1">{deal.business?.businessName}</Text>
                                <Text className="text-white font-black text-3xl leading-none shadow-sm" numberOfLines={2}>{deal.title}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View className="flex-1 bg-white -mt-6 rounded-t-3xl px-6 pt-8">

                    {/* The Offer */}
                    <View className="flex-row justify-between items-start mb-8 border-b border-slate-100 pb-8">
                        <View>
                            <Text className="text-slate-400 font-bold text-sm uppercase mb-1">Total Price</Text>
                            <View className="flex-row items-baseline gap-2">
                                <Text className="text-slate-900 font-black text-4xl">{deal.discountedPrice || 'Free '} DT</Text>
                                {deal.price && (
                                    <Text className="text-slate-400 font-bold text-lg line-through">{deal.price} DT</Text>
                                )}
                            </View>
                        </View>
                        <View className="items-end">
                            <View className="bg-red-500 px-3 py-1.5 rounded-xl shadow-lg shadow-red-200 mb-2">
                                <Text className="text-white font-black text-lg">{deal.discountValue}</Text>
                            </View>
                            {isLowStock && (
                                <Text className="text-red-500 font-bold text-xs animate-pulse">Only {inventoryLeft} left!</Text>
                            )}
                        </View>
                    </View>

                    {/* Action Grid (Directions, Contact) */}
                    <View className="flex-row gap-4 mb-8">
                        <TouchableOpacity onPress={openMaps} className="flex-1 bg-blue-50 py-3 rounded-2xl flex-row items-center justify-center gap-2 border border-blue-100">
                            <Ionicons name="navigate" size={20} color="#2563eb" />
                            <Text className="text-blue-600 font-bold">Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleContact} className="flex-1 bg-green-50 py-3 rounded-2xl flex-row items-center justify-center gap-2 border border-green-100">
                            <Ionicons name="call" size={20} color="#16a34a" />
                            <Text className="text-green-600 font-bold">Contact</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info */}
                    <Text className="text-xl font-bold text-slate-900 mb-3">About this Deal</Text>
                    <Text className="text-slate-600 leading-relaxed text-base mb-8">{deal.description}</Text>

                    <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons name="hourglass" size={18} color="#64748b" />
                            <Text className="text-slate-600 font-bold">Expires: {expiryDate}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="information-circle" size={18} color="#64748b" />
                            <Text className="text-slate-600 font-bold text-xs leading-5 flex-1">
                                Show this code at checkout to redeem. Valid ID may be required.
                            </Text>
                        </View>
                    </View>

                    {/* Map Preview */}
                    <Text className="text-xl font-bold text-slate-900 mb-4">Location</Text>
                    <View className="h-48 rounded-3xl overflow-hidden border border-slate-200 mb-10">
                        {deal.business?.latitude && (
                            <MapView
                                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                                style={{ flex: 1 }}
                                initialRegion={{
                                    latitude: parseFloat(deal.business.latitude),
                                    longitude: parseFloat(deal.business.longitude),
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                liteMode={Platform.OS === 'android'} // Lightweight for scrollview
                                scrollEnabled={false}
                                zoomEnabled={false}
                                onPress={openMaps}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(deal.business.latitude),
                                        longitude: parseFloat(deal.business.longitude),
                                    }}
                                />
                            </MapView>
                        )}
                    </View>

                    {/* Similar Deals */}
                    {similarDeals && similarDeals.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-xl font-bold text-slate-900 mb-4">You might also like</Text>
                            <FlatList
                                horizontal
                                data={similarDeals}
                                keyExtractor={(item: any) => item.id.toString()}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ width: width * 0.7 }}>
                                        <DealCard deal={item} />
                                    </View>
                                )}
                            />
                        </View>
                    )}

                </View>
            </ScrollView>

            {/* Sticky Footer CTA */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    disabled={redeeming}
                    className="w-full bg-slate-900 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-slate-400"
                >
                    {/* No Loading Spinner here, done in Modal */}
                    <Text className="text-white font-black text-lg mr-2">Get Deal Now</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Checkout Modal */}
            <CheckoutModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleRedeem}
                dealTitle={deal?.title || ''}
                businessName={deal?.business?.businessName || ''}
                price={deal?.price || 0}
                discountedPrice={deal?.discountedPrice || 0}
                image={deal?.image || deal?.business?.logo}
                loading={redeeming}
            />
=======
            {/* Hero Image */}
            <View className="h-72 w-full relative bg-slate-900">
                <Image
                    source={{ uri: deal.image || deal.business?.coverImage }}
                    className="w-full h-full opacity-80"
                    resizeMode="cover"
                />
                <View className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

                <SafeAreaView className="absolute top-0 left-0 w-full z-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="ml-6 mt-2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
                    >
                        <FontAwesome5 name="arrow-left" size={16} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            {/* Content Sheet */}
            <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8 pb-24 shadow-xl">
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Header Info */}
                    <TouchableOpacity
                        className="flex-row items-center gap-3 mb-4 active:opacity-70"
                        onPress={() => router.push({
                            pathname: '/business/[main]',
                            params: {
                                main: deal.business?.businessName, // Required param
                                name: deal.business?.businessName,
                                logo: deal.business?.logo,
                                cover: deal.business?.coverImage,
                                latitude: deal.business?.latitude,
                                longitude: deal.business?.longitude,
                                address: deal.business?.address
                            }
                        })}
                    >
                        <Image
                            source={{ uri: deal.business?.logo }}
                            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
                            resizeMode="cover"
                        />
                        <View>
                            <Text className="text-slate-900 font-bold text-base">{deal.business?.businessName}</Text>
                            <Text className="text-slate-400 text-xs uppercase font-bold tracking-wider">{deal.category}</Text>

                            {/* Address Display - Interactive */}
                            {deal.business?.address && (
                                <TouchableOpacity
                                    onPress={openMap}
                                    className="flex-row items-center gap-1.5 mt-1 active:opacity-60"
                                >
                                    <View className="bg-slate-100 p-1 rounded-md">
                                        <FontAwesome5 name="map-marker-alt" size={10} color="#006450" />
                                    </View>
                                    <Text className="text-slate-600 text-xs font-bold w-64 underline decoration-slate-300 decoration-dotted" numberOfLines={1}>
                                        {deal.business.address}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text className="text-2xl font-black text-slate-900 leading-tight mb-4">{deal.title}</Text>

                    {/* Stock limit removed as per user request (Unlimited by default) */}
                    {/* <View className="flex-row items-center mb-8">
                        <View className="bg-red-100 px-3 py-1 rounded-full border border-red-200">
                            <Text className="text-red-700 text-xs font-bold">
                                Only {deal.stock} left
                            </Text>
                        </View>
                        <Text className="text-slate-400 ml-4 font-medium text-xs">Valid until {new Date().toLocaleDateString()}</Text>
                    </View> */}

                    <View className="flex-row items-center mb-8">
                        <View className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                            <Text className="text-green-700 text-xs font-bold">
                                Unlimited Available
                            </Text>
                        </View>
                        <Text className="text-slate-400 ml-4 font-medium text-xs">Valid until {new Date().toLocaleDateString()}</Text>
                    </View>

                    <Text className="text-slate-700 leading-relaxed text-base">{deal.description}</Text>

                    {/* General Rules */}
                    <View className="mt-8 pt-8 border-t border-slate-100">
                        <Text className="text-slate-900 font-bold mb-2">General Rules</Text>
                        <View className="flex-row items-start gap-2 mb-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                            <Text className="text-slate-500 text-sm flex-1">Valid only for students with active ID.</Text>
                        </View>
                        <View className="flex-row items-start gap-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                            <Text className="text-slate-500 text-sm flex-1">Cannot be combined with other offers.</Text>
                        </View>
                        <View className="flex-row items-start gap-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                            <Text className="text-slate-500 text-sm flex-1">Must be within 200m of store to redeem.</Text>
                        </View>
                    </View>

                </ScrollView>
            </View>

            {/* Bottom Floating Action Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-up">
                <View className="items-center">
                    {redeeming ? (
                        <ActivityIndicator color="#0f172a" />
                    ) : (
                        <>
                            {deal.redemptionType === 'LINK' ? (
                                <View className="w-full px-4">
                                    <Text className="text-center text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                                        Online Offer
                                    </Text>
                                    <TouchableOpacity
                                        className="w-full bg-indigo-600 py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                                        onPress={async () => {
                                            if (!deal.redemptionLink) return showNotification('error', "Error", "No link provided for this offer.");

                                            // Track Click
                                            try {
                                                await api.post(`/public/deals/${deal.id}/click`);
                                            } catch (e) { }

                                            // Open Link
                                            const supported = await Linking.canOpenURL(deal.redemptionLink);
                                            if (supported) {
                                                await Linking.openURL(deal.redemptionLink);
                                            } else {
                                                showNotification('error', "Error", "Cannot open this link: " + deal.redemptionLink);
                                            }
                                        }}
                                    >
                                        <Text className="text-white text-center font-bold text-lg">
                                            Visit Website <FontAwesome5 name="external-link-alt" size={16} color="white" />
                                        </Text>
                                    </TouchableOpacity>
                                    <Text className="text-center text-[10px] text-slate-300 mt-2">
                                        You will be redirected to the partner's website.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {/* Expiry Banner for Voucher Holders */}
                                    {deal.userVoucher && !deal.userVoucher.isUsed && (
                                        <View className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-lg flex-row items-center justify-center">
                                            <FontAwesome5 name="gift" size={16} color="#d97706" />
                                            <Text className="text-amber-800 font-bold ml-2 text-sm">
                                                Prize expires on {new Date(deal.userVoucher.expiresAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        className={`w-full py-4 rounded-xl shadow-lg flex-row items-center justify-center ${
                                            // 1. If Prize Voucher Used -> Grey
                                            deal.userVoucher?.isUsed
                                                ? 'bg-slate-100'
                                                : // 2. If Single-Use Deal Already Redeemed -> Grey
                                                (!deal.isMultiUse && deal.isRedeemed)
                                                    ? 'bg-slate-100'
                                                    : // 3. If Cooldown Active -> Grey
                                                    cooldownSeconds > 0
                                                        ? 'bg-slate-100'
                                                        : // 4. If Too Far -> Grey
                                                        (!isNearby && liveDistance !== null)
                                                            ? 'bg-slate-100'
                                                            : 'bg-[#E63946]'
                                            }`}
                                        disabled={
                                            deal.userVoucher?.isUsed ||
                                            (!deal.isMultiUse && deal.isRedeemed) ||
                                            cooldownSeconds > 0 ||
                                            (!isNearby && liveDistance !== null)
                                        }
                                        onPress={() => setShowRedeemModal(true)}
                                    >
                                        <Text className={`font-black text-lg ${deal.userVoucher?.isUsed ||
                                                (!deal.isMultiUse && deal.isRedeemed) ||
                                                cooldownSeconds > 0 ||
                                                (!isNearby && liveDistance !== null)
                                                ? 'text-slate-400'
                                                : 'text-white'
                                            }`}>
                                            {deal.userVoucher?.isUsed
                                                ? "Prize Redeemed"
                                                : (!deal.isMultiUse && deal.isRedeemed)
                                                    ? "Already Redeemed"
                                                    : cooldownSeconds > 0
                                                        ? `Redeemed! (${formatTime(cooldownSeconds)})`
                                                        : (!isNearby && liveDistance !== null)
                                                            ? `Move Closer (${(liveDistance / 1000).toFixed(1)} km)`
                                                            : (deal.userVoucher ? "Swipe to Claim Prize" : "Tap to Collect")
                                            }
                                        </Text>
                                    </TouchableOpacity>

                                    <Modal
                                        visible={showRedeemModal}
                                        onClose={() => setShowRedeemModal(false)}
                                        title={deal.userVoucher ? "Claim Your Prize" : "Confirm Redemption"}
                                    >
                                        <View className="items-center py-4">
                                            <Text className="text-slate-500 text-center mb-8 px-4">
                                                Please ask the staff before swiping. This cannot be undone.
                                            </Text>
                                            <SwipeToRedeem
                                                onRedeem={() => {
                                                    setShowRedeemModal(false);
                                                    handleRedeem();
                                                }}
                                                disabled={false} // Already checked via button access
                                                text={deal.userVoucher ? "Swipe to Claim >>" : "Swipe to Confirm >>"}
                                                isRedeemed={!!(deal.userVoucher?.isUsed || deal.isRedeemed || redeemedAt)}
                                                redeemedAt={redeemedAt || (deal.userVoucher?.isUsed ? new Date() : undefined)}
                                            />
                                        </View>
                                    </Modal>
                                </>
                            )}
                        </>
                    )}
                </View>
            </View>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        </View>
    );
}
