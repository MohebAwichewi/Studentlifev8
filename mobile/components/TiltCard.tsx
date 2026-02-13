import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';

export default function TiltCard({ children }: { children: React.ReactNode }) {
    const [{ x, y }, setData] = useState({ x: 0, y: 0, z: 0 });
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        Gyroscope.setUpdateInterval(16); // 60fps
        const subscription = Gyroscope.addListener(data => {
            rotateX.value = withSpring(data.y * 10); // Tilt up/down
            rotateY.value = withSpring(data.x * 10); // Tilt left/right
        });
        return () => subscription && subscription.remove();
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateX: `${rotateX.value}deg` },
                { rotateY: `${rotateY.value}deg` },
            ],
        };
    });

    return (
        <Animated.View style={[styles.card, animatedStyle, { width: screenWidth * 0.85, height: screenWidth * 1.3 }]}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: 'white'
    },
});
