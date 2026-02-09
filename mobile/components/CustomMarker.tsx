import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Image } from 'expo-image';

interface CustomMarkerProps {
    business: any;
    onPress: () => void;
}

export default function CustomMarker({ business, onPress }: CustomMarkerProps) {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    const stopTracking = () => {
        setTracksViewChanges(false);
    };

    // Ensure we stop tracking eventually even if image load fails
    useEffect(() => {
        const timer = setTimeout(() => {
            setTracksViewChanges(false);
        }, 500); // Stop tracking after 500ms regardless to save perf
        return () => clearTimeout(timer);
    }, []);

    return (
        <Marker
            coordinate={{ latitude: business.latitude, longitude: business.longitude }}
            onPress={onPress}
            tracksViewChanges={tracksViewChanges}
        >
            <View className="items-center justify-center">
                {/* Info Bubble Container */}
                <View className="bg-white p-1 rounded-full shadow-lg border border-slate-100 elevation-5">
                    <View className="w-10 h-10 rounded-full overflow-hidden bg-slate-50 items-center justify-center">
                        {business.logo ? (
                            <Image
                                source={{ uri: business.logo }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                                onLoad={stopTracking}
                                onError={stopTracking}
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <View className="w-full h-full bg-slate-100 items-center justify-center">
                                <Text className="font-bold text-slate-500 text-xs">
                                    {business.businessName?.charAt(0) || '?'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                {/* Pointer / Triangle */}
                <View className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white shadow-sm -mt-0.5" />
            </View>
        </Marker>
    );
}
