import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Props {
    visible: boolean;
    title: string;
    message: string;
    type: NotificationType;
    onHide: () => void;
}

export default function CustomNotification({ visible, title, message, type, onHide }: Props) {
    const translateY = useSharedValue(-150);

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'bg-green-500', icon: 'checkmark-circle' };
            case 'error': return { bg: 'bg-red-500', icon: 'alert-circle' };
            case 'warning': return { bg: 'bg-orange-500', icon: 'warning' };
            default: return { bg: 'bg-blue-500', icon: 'information-circle' };
        }
    };

    const { bg, icon } = getColors();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 15 });
            const timer = setTimeout(() => {
                hide();
            }, 4000); // Auto hide after 4s
            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(onHide)();
            }
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[animatedStyle]}
            className="absolute top-0 left-0 right-0 z-50 px-4 pt-4"
        >
            <SafeAreaView edges={['top']}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={hide}
                    className={`flex-row items-center p-4 rounded-2xl shadow-lg ${bg}`}
                >
                    <Ionicons name={icon as any} size={28} color="white" />
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-bold text-base">{title}</Text>
                        <Text className="text-white text-sm opacity-90 leading-tight mt-0.5">{message}</Text>
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </Animated.View>
    );
}
