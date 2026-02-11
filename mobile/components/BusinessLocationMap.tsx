import React, { useMemo } from 'react';
import { View, Text, Linking, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BusinessLocationMapProps {
    latitude: number;
    longitude: number;
    title: string;
}

const BusinessLocationMap = ({ latitude, longitude, title }: BusinessLocationMapProps) => {

    const openMaps = async () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${latitude},${longitude}`;
        const label = title;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url as string).catch(err => {
                // Fallback to web
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
            });
        } else {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
        }
    };

    return (
        <View className="flex-1 bg-slate-100 items-center justify-center">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={openMaps}
                className="items-center justify-center p-4 w-full h-full"
            >
                <View className="mb-2 bg-red-100 p-3 rounded-full">
                    <Ionicons name="location" size={24} color="#E63946" />
                </View>
                <Text className="font-bold text-slate-900 text-sm text-center mb-1">{title}</Text>
                <Text className="text-blue-600 font-bold text-xs">Tap to Open in Maps ↗</Text>
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(BusinessLocationMap);
