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

    const { data: deal, isLoading, error } = useQuery({
        queryKey: ['deal', id],
        queryFn: async () => {
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
        },
        enabled: !!id
    });

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
        if (!deal) return;
        setRedeeming(true);

        try {
            // 1. Check Cooldown
            const lastRedeem = await AsyncStorage.getItem(`last_redeem_${id}`);
            if (lastRedeem) {
                const diff = Date.now() - parseInt(lastRedeem);
                const cooldown = 12 * 60 * 60 * 1000; // 12 hours check (adjust as needed)
                if (diff < cooldown && !deal.isMultiUse) {
                    Alert.alert("Already Redeemed", "You have already used this deal recently.");
                    setRedeeming(false);
                    setModalVisible(false); // Close Modal
                    return;
                }
            }

            // 2. Check Permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need location access to verify you are in-store.");
                setRedeeming(false);
                return;
            }

            // 3. Get Location
            const location = await Location.getCurrentPositionAsync({});

            // 4. Calculate Distance
            const userLoc = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            const businessLoc = { latitude: deal.business.latitude, longitude: deal.business.longitude };

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
            setRedeeming(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    if (error || !deal) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <FontAwesome5 name="exclamation-circle" size={48} color="#ef4444" />
                <Text className="text-slate-900 font-bold text-xl mt-4">Oops!</Text>
                <Text className="text-slate-500 text-center mt-2 mb-6">We couldn't load this deal. It might have expired or been removed.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-slate-900 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Prepare images for carousel (mock if only single)
    const images = deal.images || [deal.image || deal.business?.coverImage || 'https://via.placeholder.com/400'];

    // Countdown Logic (Basic display)
    const expiryDate = deal.expiryDate ? new Date(deal.expiryDate).toLocaleDateString() : 'N/A';
    const inventoryLeft = deal.inventory ? deal.inventory : 999;
    const isLowStock = inventoryLeft < 10;

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

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
        </View>
    );
}
