import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface Deal {
    id: number;
    title: string;
    description: string;
    discountValue: string;
    image: string;
    category: string;
    expiry?: string; // Added field
    redemptionType?: string; // Added field
    isMultiUse?: boolean;
    business: {
        businessName: string;
        logo: string;
        coverPhoto?: string;
    };
    lastRedemption?: string; // ISO Date string
}

export default function DealCard({ deal }: { deal: Deal }) {
    const [cooldownLeft, setCooldownLeft] = useState<string | null>(null);
    const [isCooldownActive, setIsCooldownActive] = useState(false);

    useEffect(() => {
        if (deal.isMultiUse && deal.lastRedemption) {
            const checkCooldown = () => {
                const now = new Date().getTime();
                const last = new Date(deal.lastRedemption!).getTime();
                const cooldownMs = 12 * 60 * 60 * 1000; // 12 Hours
                const diff = now - last;

                if (diff < cooldownMs) {
                    setIsCooldownActive(true);
                    const remainingMs = cooldownMs - diff;
                    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                    setCooldownLeft(`${hours}h ${minutes}m`);
                } else {
                    setIsCooldownActive(false);
                    setCooldownLeft(null);
                }
            };

            checkCooldown();
            const timer = setInterval(checkCooldown, 60000); // Update every minute
            return () => clearInterval(timer);
        }
    }, [deal.lastRedemption, deal.isMultiUse]);

    // Render Cooldown Overlay
    const renderCooldownOverlay = () => {
        if (!isCooldownActive) return null;
        return (
            <View className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm items-center justify-center rounded-3xl">
                <View className="bg-slate-900 px-6 py-4 rounded-2xl items-center shadow-xl">
                    <Ionicons name="time" size={32} color="white" />
                    <Text className="text-white font-black text-lg mt-2">COOLDOWN</Text>
                    <Text className="text-slate-300 font-bold text-sm mt-1">Available in {cooldownLeft}</Text>
                </View>
            </View>
        );
    };

    const CardContent = (
        <View
            className={`bg-white rounded-3xl mb-1 shadow-sm shadow-slate-200 overflow-hidden border border-slate-100 ${isCooldownActive ? 'opacity-90' : 'active:opacity-95'}`}
            style={{ width: '100%' }}
        >
            {renderCooldownOverlay()}

            {/* Cover Image */}
            <View className="h-44 bg-slate-200 relative">
                <Image
                    source={{ uri: deal.image || deal.business.coverPhoto || 'https://via.placeholder.com/400' }}
                    className={`w-full h-full ${isCooldownActive ? 'grayscale' : ''}`}
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    className="absolute bottom-0 left-0 right-0 h-24"
                />

                <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                    <Text className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{deal.category}</Text>
                </View>

                {deal.isMultiUse && (
                    <View className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                        <Text className="text-[10px] font-black text-white uppercase tracking-widest">MULTI-USE</Text>
                    </View>
                )}
            </View>

            {/* Floating Info */}
            <View className="px-5 -mt-8 flex-row justify-between items-end">
                <View className="shadow-lg shadow-black/20">
                    <Image
                        source={{ uri: deal.business.logo || 'https://via.placeholder.com/50' }}
                        className="w-16 h-16 rounded-2xl bg-white border-4 border-white"
                    />
                </View>
                <View className="bg-slate-900 px-4 py-2 rounded-xl shadow-lg shadow-slate-300 mb-2">
                    <Text className="text-white font-black text-sm">{deal.discountValue}</Text>
                </View>
            </View>

            {/* Content */}
            <View className="p-5 pt-3">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <Text className="text-base font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-70">{deal.business.businessName}</Text>
                        <Text className="text-xl font-black text-slate-900 leading-tight mb-2">{deal.title}</Text>
                        <Text className="text-slate-500 text-sm leading-relaxed" numberOfLines={2}>{deal.description}</Text>
                    </View>
                </View>

                {/* Action Bar */}
                <View className="flex-row items-center justify-between mt-4 border-t border-slate-100 pt-4">
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#64748b" />
                        <Text className="text-xs font-bold text-slate-500 ml-1">2.5km away</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-blue-600 mr-1">Get Deal</Text>
                        <FontAwesome5 name="arrow-right" size={10} color="#2563eb" />
                    </View>
                </View>
            </View>
        </View>
    );

    if (isCooldownActive) {
        return (
            <View>
                {CardContent}
            </View>
        )
    }

    return (
        <Link href={{ pathname: '/deal/[id]', params: { id: deal.id } }} asChild>
            <TouchableOpacity>
                {CardContent}
            </TouchableOpacity>
        </Link>
        latitude?: number;
        longitude?: number;
    };
    lastRedemption?: string; // ISO Date string
    distance?: number | null; // Distance in km from user
}

const { width } = Dimensions.get('window');

export default function DealCard({ deal, userLocation }: {
    deal: Deal;
    userLocation?: { latitude: number; longitude: number } | null;
}) {
    // Cooldown state removed from list view - only shown on detail page

    // Cooldown logic removed from list view - only shown on detail page

    const router = useRouter();

    // Cooldown overlay removed - cards always show normally in list view

    return (
        <TouchableOpacity
            activeOpacity={0.9} // Subtler press effect
            onPress={() => router.push({ pathname: '/deal/[id]', params: { id: String(deal.id) } })}
            className="bg-white rounded-xl shadow-sm shadow-slate-200 overflow-hidden border border-slate-100"
            style={{ width: '100%' }}
        >
            {/* Cover Image Area */}
            <View className="h-44 bg-slate-200 relative">
                {(deal.image || deal.business.coverPhoto) && (
                    <Image
                        source={{ uri: deal.image || deal.business.coverPhoto }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                )}

                {/* Dark Overlay Gradient (Subtle) */}
                <View className="absolute inset-0 bg-black/5" pointerEvents="none" />

                {/* Content Area */}

                {/* Top Right Heart Icon */}
                <TouchableOpacity
                    className="absolute top-3 right-3 w-8 h-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
                    onPress={(e) => {
                        e.stopPropagation();
                        // TODO: Toggle favorite logic
                    }}
                >
                    <Ionicons name="heart-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View className="px-4 pb-4 pt-8 relative">

                {/* Floating Logo Circle (Overlapping Image) */}
                <TouchableOpacity
                    className="absolute -top-6 left-4 bg-white rounded-full shadow-sm border-2 border-white z-10 overflow-hidden"
                    onPress={(e) => {
                        e.stopPropagation();
                        // Navigate to brand profile
                        router.push({
                            pathname: '/business/[main]',
                            params: {
                                name: deal.business.businessName,
                                logo: deal.business.logo,
                                cover: deal.business.coverPhoto,
                                latitude: deal.business.latitude,
                                longitude: deal.business.longitude,
                            }
                        })
                    }}
                >
                    <Image
                        source={{ uri: deal.business.logo }}
                        style={{ width: 44, height: 44 }}
                        className="rounded-full"
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </TouchableOpacity>

                {/* Title & Subtitle */}
                <View className="mb-1">
                    <Text className="text-[17px] font-bold text-slate-900 leading-tight mb-0.5" numberOfLines={1}>
                        {deal.business.businessName}
                    </Text>
                    <Text className="text-[15px] text-slate-500 font-medium" numberOfLines={1}>
                        {deal.title}
                    </Text>
                </View>

                {/* Footer Info: Expiry & Distance */}
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-slate-400 font-medium">
                        {deal.expiry ? `Valid until ${new Date(deal.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Ongoing Offer'}
                        {deal.distance != null ? ` • ${deal.distance.toFixed(1)} km` : ''}
                    </Text>

                    {/* Price / Discount */}
                    <Text className="text-lg font-black text-slate-900">
                        {deal.discountValue}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
