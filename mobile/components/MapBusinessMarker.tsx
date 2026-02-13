import React from 'react';
import { View, Image, Text } from 'react-native';
import { Marker } from 'react-native-maps';

interface Business {
    id: string;
    businessName: string;
    logo: string;
    latitude: number;
    longitude: number;
    dealCount: number;
}

interface MapBusinessMarkerProps {
    business: Business;
    onPress: () => void;
}

export default function MapBusinessMarker({ business, onPress }: MapBusinessMarkerProps) {
    return (
        <Marker
            coordinate={{
                latitude: business.latitude,
                longitude: business.longitude
            }}
            onPress={onPress}
            tracksViewChanges={false} // Performance optimization
        >
            <View className="items-center">
                {/* Logo Marker */}
                <View className="w-12 h-12 rounded-full border-3 border-white bg-white shadow-lg overflow-hidden">
                    {business.logo ? (
                        <Image
                            source={{ uri: business.logo }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-blue-600 items-center justify-center">
                            <Text className="text-white font-bold text-xs">
                                {business.businessName.charAt(0)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Deal Count Badge */}
                {business.dealCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                        <Text className="text-white font-bold text-[10px]">
                            {business.dealCount}
                        </Text>
                    </View>
                )}
            </View>
        </Marker>
    );
}
