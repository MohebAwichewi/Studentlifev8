import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Alert, Dimensions, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DealCard from '../../components/DealCard';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Mock Working Hours until schema supports it
const MOCK_HOURS = [
    { day: 0, open: '09:00', close: '22:00' }, // Sunday
    { day: 1, open: '09:00', close: '22:00' }, // Monday
    { day: 2, open: '09:00', close: '22:00' },
    { day: 3, open: '09:00', close: '22:00' },
    { day: 4, open: '09:00', close: '23:00' },
    { day: 5, open: '09:00', close: '23:00' }, // Friday
    { day: 6, open: '10:00', close: '23:00' }, // Saturday
];

export default function BusinessProfile() {
    const { id, name, logo, cover } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isFollowing, setIsFollowing] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Fetch Business Details
    const { data: business, isLoading: loadingBusiness } = useQuery({
        queryKey: ['business', id],
        queryFn: async () => {
            // Fallback to searching in deals if no direct endpoint
            const res = await api.get('/public/deals');
            const deals = res.data.deals || [];
            const found = deals.find((d: any) => d.businessId === id || d.business.id === id || d.business.businessName === name);
            return found ? found.business : { id, businessName: name, logo, coverImage: cover, phone: '+216 12 345 678', address: 'Tunis, Tunisia' };
        },
        enabled: !!id || !!name
    });

    // Fetch Deals
    const { data: businessDeals, isLoading: loadingDeals } = useQuery({
        queryKey: ['business_deals', id],
        queryFn: async () => {
            const res = await api.get('/public/deals');
            const all = res.data.deals || [];
            return all.filter((d: any) => d.businessId === id || d.business.id === id || d.business.businessName === name);
        }
    });

    // Check Follow Status
    useEffect(() => {
        const checkFollow = async () => {
            if (!user) return;
            try {
                const res = await api.get('/user/follow');
                const followed = res.data.followedBusinesses || [];
                const isF = followed.some((b: any) => b.businessId === id || b.id === id);
                setIsFollowing(isF);
            } catch (e) { console.log("Follow check failed", e); }
        };
        checkFollow();
    }, [user, id]);

    const followMutation = useMutation({
        mutationFn: async () => {
            return api.post('/user/follow', { businessId: id || business?.id });
        },
        onMutate: async () => {
            const prev = isFollowing;
            setIsFollowing(!prev);
            return { prev };
        },
        onError: (err, newTodo, context) => {
            setIsFollowing(context?.prev || false);
            Alert.alert("Error", "Could not update follow status.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['followed_businesses'] });
        }
    });

    const displayBusiness = business || { businessName: name, logo, coverImage: cover };
    const deals = businessDeals || [];

    // Status Logic
    const getStatus = () => {
        const now = new Date();
        const day = now.getDay();
        const hours = MOCK_HOURS.find(h => h.day === day);
        if (!hours) return { isOpen: false, text: 'Closed today' };

        const current = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = hours.open.split(':').map(Number);
        const [closeH, closeM] = hours.close.split(':').map(Number);

        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;

        if (current >= openTime && current < closeTime) {
            return { isOpen: true, text: `Open until ${hours.close}` };
        } else if (current < openTime) {
            return { isOpen: false, text: `Closed • Opens at ${hours.open}` };
        } else {
            return { isOpen: false, text: `Closed • Opens tomorrow` };
        }
    };

    const status = getStatus();

    const handleCall = () => {
        const phone = displayBusiness.phone || '+216 12 345 678';
        Linking.openURL(`tel:${phone}`);
    };

    const handleMap = () => {
        const latLng = `${displayBusiness.latitude || 36.8},${displayBusiness.longitude || 10.1}`;
        const label = displayBusiness.businessName;
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`
        });
        Linking.openURL(url as string);
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" stickyHeaderIndices={[1]}>

                {/* Header / Cover */}
                <View className="h-64 relative bg-slate-900">
                    <Image
                        source={{ uri: displayBusiness.coverImage || displayBusiness.cover || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop' }}
                        className="w-full h-full opacity-70"
                        resizeMode="cover"
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0" />

                    <SafeAreaView className="absolute top-0 left-0 w-full z-10 flex-row justify-between px-6 pt-2">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
                        >
                            <FontAwesome5 name="arrow-left" size={16} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View className="absolute bottom-[-40px] left-6 right-6 flex-row items-end">
                        <View className="shadow-xl shadow-black/50 z-20">
                            <Image
                                source={{ uri: displayBusiness.logo || 'https://via.placeholder.com/100' }}
                                className="w-24 h-24 rounded-full border-4 border-white bg-white"
                                resizeMode="cover"
                            />
                            {/* Verified Badge */}
                            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-2 border-white">
                                <MaterialIcons name="verified" size={14} color="white" />
                            </View>
                        </View>
                        <View className="flex-1 ml-4 mb-10">
                            <Text className="text-white font-black text-2xl shadow-sm tracking-tight" numberOfLines={1}>
                                {displayBusiness.businessName}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <View className={`px-2 py-0.5 rounded-md ${status.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                    <Text className="text-white text-[10px] font-bold uppercase">{status.isOpen ? 'Open' : 'Closed'}</Text>
                                </View>
                                <Text className="text-slate-300 text-xs font-medium shadow-sm">{status.text}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Primary Actions (Sticky) */}
                <View className="bg-white/40 backdrop-blur-lg pt-12 pb-4 px-6 flex-row gap-3 border-b border-slate-100/50 shadow-sm z-0">
                    <TouchableOpacity
                        onPress={() => followMutation.mutate()}
                        className={`flex-1 py-3 rounded-full shadow-sm flex-row items-center justify-center gap-2 ${isFollowing ? 'bg-slate-200 border border-slate-300' : 'bg-red-500'}`}
                    >
                        <FontAwesome5 name={isFollowing ? "check" : "plus"} size={12} color={isFollowing ? "#475569" : "white"} />
                        <Text className={`font-bold text-sm ${isFollowing ? 'text-slate-600' : 'text-white'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCall} className="w-12 h-12 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
                        <Ionicons name="call" size={20} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleMap} className="w-12 h-12 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
                        <FontAwesome5 name="directions" size={18} color="#0f172a" />
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View className="px-6 py-6 bg-white">
                    <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">About</Text>
                    <Text className="text-slate-700 leading-relaxed text-base" numberOfLines={expanded ? undefined : 3}>
                        {displayBusiness.description || "Top-rated partner offering exclusive deals to WIN users. Visit us for great savings and quality service."}
                    </Text>
                    <TouchableOpacity onPress={() => setExpanded(!expanded)} className="mt-2">
                        <Text className="text-blue-600 font-bold text-xs">{expanded ? 'Show Less' : 'Read More'}</Text>
                    </TouchableOpacity>

                    {/* Stats */}
                    <View className="flex-row justify-between mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <View className="items-center flex-1">
                            <Text className="font-black text-xl text-slate-900">{deals.length}</Text>
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Deals</Text>
                        </View>
                        <View className="w-[1px] bg-slate-200" />
                        <View className="items-center flex-1">
                            <Text className="font-black text-xl text-slate-900">4.8</Text>
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Rating</Text>
                        </View>
                        <View className="w-[1px] bg-slate-200" />
                        <View className="items-center flex-1">
                            <Text className="font-black text-xl text-slate-900">98%</Text>
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Response</Text>
                        </View>
                    </View>
                </View>

                {/* Map Preview */}
                <View className="px-6 mb-8">
                    <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3">Location</Text>
                    <TouchableOpacity onPress={handleMap} activeOpacity={0.9} className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 relative">
                        <MapView
                            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: displayBusiness.latitude || 36.8065,
                                longitude: displayBusiness.longitude || 10.1815,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: displayBusiness.latitude || 36.8065,
                                    longitude: displayBusiness.longitude || 10.1815
                                }}
                            />
                        </MapView>
                        <View className="absolute inset-0 bg-black/10 items-center justify-center">
                            <View className="bg-white/90 px-4 py-2 rounded-full shadow-sm">
                                <Text className="font-bold text-xs text-slate-900">View on Map</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text className="text-slate-500 text-xs font-medium ml-1">
                        {displayBusiness.address || "Tunis, Tunisia"}
                    </Text>
                </View>

                {/* Deal Inventory */}
                <View className="bg-slate-50 pt-8 pb-32 rounded-t-[30px] min-h-[500px] shadow-inner">
                    <View className="px-6 mb-6 flex-row items-baseline justify-between">
                        <Text className="text-xl font-black text-slate-900">Active Deals</Text>
                        {deals.length > 0 && <Text className="text-slate-400 text-xs font-bold">{deals.length} available</Text>}
                    </View>

                    {loadingDeals ? (
                        <View className="items-center py-10"><ActivityIndicator color="#0f172a" /></View>
                    ) : deals.length > 0 ? (
                        deals.map((deal: any) => (
                            <View key={deal.id} className="mb-6 px-4">
                                <DealCard deal={deal} />
                            </View>
                        ))
                    ) : (
                        <View className="items-center mt-10 px-10">
                            <MaterialIcons name="local-offer" size={48} color="#cbd5e1" />
                            <Text className="text-slate-900 font-bold mt-4">No active deals</Text>
                            <Text className="text-slate-400 text-center mt-2 text-xs">
                                Looks like {displayBusiness.businessName} doesn't have any deals running right now. Follow them to get notified!
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}
