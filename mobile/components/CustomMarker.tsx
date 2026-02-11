import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Image } from 'expo-image';

interface CustomMarkerProps {
    business: any;
    onSelect: (business: any) => void;
}

function CustomMarker({ business, onSelect }: CustomMarkerProps) {
    // START FALSE: Don't track by default to save memory
    const [tracksViewChanges, setTracksViewChanges] = useState(false);
    const iconUrl = business.logo;

    // Optimization: If it's a Cloudinary URL, request a small thumbnail
    const optimizedUrl = useMemo(() => {
        if (iconUrl && iconUrl.includes('cloudinary.com') && !iconUrl.includes('w_')) {
            // Append transformation for 64x64 thumbnail, quality auto
            return iconUrl.replace('/upload/', '/upload/w_64,h_64,c_fill,q_auto/');
        }
        return iconUrl;
    }, [iconUrl]);

    // When image loads, pulse the tracking for a split second to capture the bitmap
    const triggerRefresh = () => {
        setTracksViewChanges(true);
        // Stop tracking almost immediately after capturing the new image
        setTimeout(() => {
            setTracksViewChanges(false);
        }, 100);
    };

    const handlePress = () => {
        onSelect(business);
    };

    return (
        <Marker
            coordinate={{ latitude: business.latitude, longitude: business.longitude }}
            onPress={handlePress}
            tracksViewChanges={tracksViewChanges}
            tracksInfoWindowChanges={false}
        >
            <View className="items-center justify-center w-12 h-12">
                {/* Simplified visual structure: Remove extra nesting/shadows if possible for perf */}
                <View className="bg-white p-0.5 rounded-full border border-slate-200 elevation-2">
                    <View className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 items-center justify-center">
                        {optimizedUrl ? (
                            <Image
                                source={{ uri: optimizedUrl }}
                                style={{ width: 40, height: 40 }}
                                contentFit="cover"
                                onLoad={triggerRefresh} // Only track when we have pixels
                                cachePolicy="memory-disk"
                                transition={200} // Fast fade in
                            />
                        ) : (
                            <Text className="font-bold text-slate-400 text-[10px]">
                                {business.businessName?.charAt(0) || '?'}
                            </Text>
                        )}
                    </View>
                </View>
                {/* Triangle - kept simple */}
                <View className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5" />
            </View>
        </Marker>
    );
}

// Optimization: Memoize the component to prevent re-renders if props haven't changed
export default React.memo(CustomMarker, (prev, next) => {
    return prev.business.id === next.business.id && prev.business.logo === next.business.logo;
});
