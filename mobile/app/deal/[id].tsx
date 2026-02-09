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

    const { data: deal, isLoading, error } = useQuery({
        queryKey: ['deal', id],
        queryFn: async () => {
            console.log("Fetching deal with ID:", id); // LOG
            if (!id) throw new Error("No ID provided");

            // ✅ Use the new dedicated endpoint
            const res = await api.get(`/public/deals/${id}`);
            console.log("Deal Fetch Response:", res.data); // LOG

            if (res.data && res.data.deal) {
                return res.data.deal;
            }
            throw new Error('Deal not found');
        },
        enabled: !!id
    });

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
        if (!deal) return;
        setRedeeming(true);

        try {
            // 1. Check Cooldown
            const lastRedeem = await AsyncStorage.getItem(`last_redeem_${id}`);
            if (lastRedeem) {
                const diff = Date.now() - parseInt(lastRedeem);
                const cooldown = 5 * 60 * 1000; // 5 minutes
                if (diff < cooldown) {
                    const remaining = Math.ceil((cooldown - diff) / 60000);
                    showNotification('warning', "Cooldown Active", `Please wait ${remaining} minutes before redeeming again.`);
                    setRedeeming(false);
                    return;
                }
            }

            // 2. Check Permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showNotification('error', "Permission Denied", "We need location access to verify you are in-store.");
                setRedeeming(false);
                return;
            }

            // 3. Get Location
            const location = await Location.getCurrentPositionAsync({});

            // 4. Calculate Distance
            const userLoc = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            const businessLoc = { latitude: deal.business.latitude, longitude: deal.business.longitude };

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
            showNotification('success', "Success!", "Offer redeemed successfully.");

            // Removed Navigation to Success Screen
        } catch (error: any) {

            const msg = error.response?.data?.error || "Could not verify location or redemption failed. Try again.";
            showNotification('error', "Redemption Failed", msg);
            setRedeeming(false);
        }
    };

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
        );
    }

    if (error || !deal) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
                <FontAwesome5 name="exclamation-circle" size={48} color="#ef4444" />
                <Text className="text-slate-900 font-bold text-xl mt-4">Oops!</Text>
                <Text className="text-slate-500 text-center mt-2 mb-6">We couldn't load this deal. It might have expired or been removed.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-slate-900 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

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

                    <View className="flex-row items-center mb-8">
                        <View className="bg-red-100 px-3 py-1 rounded-full border border-red-200">
                            <Text className="text-red-700 text-xs font-bold">
                                Only {deal.stock} left
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
                                    <TouchableOpacity
                                        className={`w-full py-4 rounded-xl shadow-lg flex-row items-center justify-center ${deal.isRedeemed // ✅ Check Server Status FIRST
                                            ? 'bg-slate-100'
                                            : (!isNearby && liveDistance !== null) || cooldownSeconds > 0
                                                ? 'bg-slate-100'
                                                : 'bg-[#E63946]'
                                            }`}
                                        disabled={deal.isRedeemed || (!isNearby && liveDistance !== null) || cooldownSeconds > 0}
                                        onPress={() => setShowRedeemModal(true)}
                                    >
                                        <Text className={`font-black text-lg ${deal.isRedeemed || (!isNearby && liveDistance !== null) || cooldownSeconds > 0
                                            ? 'text-slate-400'
                                            : 'text-white'
                                            }`}>
                                            {deal.isRedeemed
                                                ? "Already Redeemed" // ✅ Server says Used
                                                : cooldownSeconds > 0
                                                    ? `Redeemed! (${formatTime(cooldownSeconds)})` // Local Cooldown
                                                    : (!isNearby && liveDistance !== null)
                                                        ? `Move Closer (${(liveDistance / 1000).toFixed(1)} km)`
                                                        : "Tap to Collect"
                                            }
                                        </Text>
                                    </TouchableOpacity>

                                    <Modal
                                        visible={showRedeemModal}
                                        onClose={() => setShowRedeemModal(false)}
                                        title="Confirm Redemption"
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
                                                text="Swipe to Confirm >>"
                                            />
                                        </View>
                                    </Modal>
                                </>
                            )}
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}
