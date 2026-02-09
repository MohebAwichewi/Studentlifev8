import React, { useState, useEffect } from 'react';
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
