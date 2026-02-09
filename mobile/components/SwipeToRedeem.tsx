import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolate, Extrapolate } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

interface SwipeToRedeemProps {
    onRedeem: () => void;
    disabled?: boolean;
    text?: string;
}

const BUTTON_HEIGHT = 60;
const BUTTON_WIDTH = 300;
const BUTTON_PADDING = 5;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;

export default function SwipeToRedeem({ onRedeem, disabled = false, text = "Swipe to Redeem >>" }: SwipeToRedeemProps) {
    const X = useSharedValue(0);
    const [toggled, setToggled] = React.useState(false);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            if (toggled || disabled) return;
            let newValue = e.translationX;
            if (newValue < 0) newValue = 0;
            if (newValue > H_SWIPE_RANGE) newValue = H_SWIPE_RANGE;
            X.value = newValue;
        })
        .onEnd((e) => {
            if (toggled || disabled) return;
            // Use the gesture event's translationX instead of reading X.value
            if (e.translationX < H_SWIPE_RANGE / 2) {
                X.value = withSpring(0);
            } else {
                X.value = withSpring(H_SWIPE_RANGE, {}, (finished) => {
                    if (finished) {
                        runOnJS(setToggled)(true);
                        runOnJS(onRedeem)();
                    }
                });
            }
        });

    const animatedSwipeableStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: X.value }],
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                X.value,
                [0, H_SWIPE_RANGE / 2],
                [1, 0],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <View style={styles.container}>
            <View style={[styles.swipeContainer, disabled && styles.disabledContainer]}>
                <Animated.Text style={[styles.text, animatedTextStyle, disabled && styles.disabledText]}>
                    {text}
                </Animated.Text>
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.swipeable, animatedSwipeableStyle, disabled && styles.disabledSwipeable]}>
                        <FontAwesome5 name={toggled ? "check" : "chevron-right"} size={20} color={toggled ? "#E63946" : "#0f172a"} />
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    swipeContainer: {
        height: BUTTON_HEIGHT,
        width: BUTTON_WIDTH,
        backgroundColor: '#f1f5f9',
        borderRadius: BUTTON_HEIGHT,
        padding: BUTTON_PADDING,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    text: {
        fontWeight: 'bold',
        color: '#64748b',
        position: 'absolute',
    },
    swipeable: {
        height: SWIPEABLE_DIMENSIONS,
        width: SWIPEABLE_DIMENSIONS,
        borderRadius: SWIPEABLE_DIMENSIONS,
        backgroundColor: '#fff',
        position: 'absolute',
        left: BUTTON_PADDING,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    disabledContainer: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        opacity: 0.8,
    },
    successContainer: {
        backgroundColor: '#E63946', // Red Success (User requested ALL green -> red)
        borderColor: '#e2e8f0',
        opacity: 0.8,
    },
    disabledText: {
        color: '#94a3b8',
    },
    disabledSwipeable: {
        opacity: 0.5,
    }
});
