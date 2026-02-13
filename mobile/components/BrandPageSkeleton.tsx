import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function BrandPageSkeleton() {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmer.value,
            [0, 0.5, 1],
            [0.3, 0.6, 0.3]
        );
        return { opacity };
    });

    return (
        <View className="flex-1 bg-white">
            {/* Cover Skeleton */}
            <Animated.View
                style={animatedStyle}
                className="h-48 bg-slate-200"
            />

            {/* Profile Info Skeleton */}
            <View className="-mt-12 px-6 mb-6">
                {/* Logo Skeleton */}
                <Animated.View
                    style={animatedStyle}
                    className="w-24 h-24 rounded-2xl bg-slate-200 border-4 border-white"
                />

                {/* Name and Button Skeleton */}
                <View className="mt-4 flex-row items-center justify-between">
                    <View className="flex-1">
                        <Animated.View
                            style={animatedStyle}
                            className="h-8 w-48 bg-slate-200 rounded-lg mb-2"
                        />
                        <Animated.View
                            style={animatedStyle}
                            className="h-4 w-32 bg-slate-200 rounded"
                        />
                    </View>
                    <Animated.View
                        style={animatedStyle}
                        className="w-24 h-10 bg-slate-200 rounded-full"
                    />
                </View>

                {/* Description Skeleton */}
                <Animated.View
                    style={animatedStyle}
                    className="h-3 w-full bg-slate-200 rounded mt-3 mb-1"
                />
                <Animated.View
                    style={animatedStyle}
                    className="h-3 w-3/4 bg-slate-200 rounded"
                />
            </View>

            {/* Active Deals Title Skeleton */}
            <View className="px-6 mb-4">
                <Animated.View
                    style={animatedStyle}
                    className="h-6 w-40 bg-slate-200 rounded"
                />
            </View>

            {/* Deal Cards Skeleton */}
            <View className="px-6">
                {[1, 2, 3].map((i) => (
                    <Animated.View
                        key={i}
                        style={animatedStyle}
                        className="h-64 bg-slate-200 rounded-2xl mb-4"
                    />
                ))}
            </View>
        </View>
    );
}
