import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: Props) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);


    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));



    useEffect(() => {
        // 1. Zoom in Logo
        scale.value = withSequence(
            withSpring(1.2, { damping: 10, stiffness: 100 }),
            withSpring(1, { damping: 12, stiffness: 100 })
        );



        // 3. Wait and then fade out everything
        const timeout = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            });
        }, 2500); // Show splash for 2.5 seconds

        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <View style={styles.content}>
                <Animated.Image
                    source={require('../assets/logo.png')}
                    style={[styles.logo, animatedLogoStyle]}
                    resizeMode="contain"
                />

            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff',
        zIndex: 99999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
    },
    highlight: {
        color: '#ef4444', // Red accent for .LIFE
    }
});
