import React, { useMemo } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Platform, StyleSheet } from 'react-native';
import { cleanMapStyle } from '../constants/mapStyle';

interface BusinessLocationMapProps {
    latitude: number;
    longitude: number;
    title: string;
}

const BusinessLocationMap = ({ latitude, longitude, title }: BusinessLocationMapProps) => {

    // Memoize region to prevent re-renders
    const region = useMemo(() => ({
        latitude,
        longitude,
        latitudeDelta: 0.005, // Slightly zoomed in
        longitudeDelta: 0.005,
    }), [latitude, longitude]);

    return (
        <View style={StyleSheet.absoluteFill}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                initialRegion={region}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                loadingEnabled={false} // Disable loading spinner for smoother look
                liteMode={true} // CRITICAL: Static bitmap on Android
                customMapStyle={cleanMapStyle}
                pointerEvents="none" // Disable touch interaction for performance
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    title={title}
                    tracksViewChanges={false} // Optimization: Static marker
                />
            </MapView>
        </View>
    );
};

export default React.memo(BusinessLocationMap);
