import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

export default function AnimatedSplash({ onFinish }: { onFinish?: () => void }) {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Animate In
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
        opacity.value = withTiming(1, { duration: 800 });

        // Optional: Animate Out logic could be handled by parent or here
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
                <View className="w-32 h-32 bg-slate-900 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-slate-200">
                    {/* Using icon.png or adaptive-icon - assuming icon.png is the main app icon */}
                    <Image
                        source={require('../assets/images/adaptive-icon.png')}
                        style={{ width: 80, height: 80, resizeMode: 'contain' }}
                    />
                </View>

                <Text className="text-3xl font-black text-slate-900 tracking-tighter">
                    WIN
                </Text>
                <Text className="text-slate-500 font-medium text-base mt-2">
                    Discover Local Deals
                </Text>
            </Animated.View>

            <View className="absolute bottom-16">
                <ActivityIndicator size="small" color="#E60023" />
            </View>
        </SafeAreaView>
    );
}
