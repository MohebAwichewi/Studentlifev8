import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface MapPreviewCardProps {
    deal: any; // Type strictly if possible, using 'any' for speed/compatibility
    onClose: () => void;
}

export default function MapPreviewCard({ deal, onClose }: MapPreviewCardProps) {
    const router = useRouter();

    if (!deal) return null;

    return (
        <View className="absolute bottom-24 left-4 right-4 bg-white rounded-3xl shadow-xl shadow-slate-400 p-4 border border-slate-100 z-50">
            {/* Close Button */}
            <TouchableOpacity
                onPress={onClose}
                className="absolute top-2 right-2 z-10 bg-slate-100 p-1.5 rounded-full"
            >
                <Ionicons name="close" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/deal/[id]', params: { id: deal.id } })}
                className="flex-row"
            >
                {/* Image */}
                <Image
                    source={{ uri: deal.image || deal.business?.coverPhoto || 'https://via.placeholder.com/150' }}
                    className="w-24 h-24 rounded-2xl bg-slate-200"
                    resizeMode="cover"
                />

                {/* Content */}
                <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center mb-1">
                        <Image
                            source={{ uri: deal.business?.logo || 'https://via.placeholder.com/20' }}
                            className="w-5 h-5 rounded-full border border-slate-100 mr-2"
                        />
                        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide flex-1" numberOfLines={1}>
                            {deal.business?.businessName}
                        </Text>
                    </View>

                    <Text className="text-slate-900 font-black text-lg leading-tight mb-1" numberOfLines={2}>
                        {deal.title}
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1">
                        <View className="bg-green-100 px-2 py-0.5 rounded-md">
                            <Text className="text-green-700 font-bold text-xs">{deal.discountValue}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="location-sharp" size={12} color="#94a3b8" />
                            {deal.distance && (
                                <Text className="text-slate-400 font-bold text-xs ml-0.5">{Math.round(deal.distance)}km</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Arrow */}
                <View className="justify-center pl-2">
                    <FontAwesome5 name="chevron-right" size={16} color="#cbd5e1" />
                </View>
            </TouchableOpacity>
        </View>
    );
}
