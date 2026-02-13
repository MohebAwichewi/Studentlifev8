import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, G, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8; // Smaller, more elegant
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

// Elegant Palette
// Dark Theme (User Requested Revert)
const COLORS = {
    NAVY: '#0f172a',     // Wheel Background
    DEEP_NAVY: '#020617', // Darker shades
    WHITE: '#FFFFFF',    // Text & Center Button
    RED: '#E63946',      // Pointer & Center Text & Spin Button Text
    GOLD: '#FFD700',     // Keep for some outlines if needed, or remove
    OVERLAY: 'rgba(0, 0, 0, 0.75)', // Dark Overlay (Dimmed)
};

// Segment Colors: Navy & Deep Navy (Alternating) or just Navy
const SEGMENT_COLORS = [COLORS.NAVY, COLORS.DEEP_NAVY];

export default function SpinWheel({ visible, onClose }: { visible: boolean, onClose: () => void }) {
    const router = useRouter();
    const [prizes, setPrizes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [nextSpin, setNextSpin] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");

    const rotation = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            fetchPrizes();
            rotation.value = 0;
            setResult(null);
            setShowResultModal(false);
            setApiError(null);
        }
    }, [visible]);

    const fetchPrizes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/student/prizes');
            if (res.data.success && res.data.prizes.length > 0) {
                setPrizes(res.data.prizes);

                // Set Countdown if exists
                if (res.data.nextSpinTime) {
                    const next = new Date(res.data.nextSpinTime);
                    if (next > new Date()) {
                        setNextSpin(next);
                    }
                }
            } else {
                setApiError("No prizes currently available.");
            }
        } catch (e) {
            setApiError("Unable to load prizes.");
        } finally {
            setLoading(false);
        }
    };

    // Countdown Timer Logic
    useEffect(() => {
        if (!nextSpin) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = nextSpin.getTime() - now.getTime();

            if (diff <= 0) {
                setNextSpin(null);
                setTimeLeft("");
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextSpin]);

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent) * RADIUS;
        const y = Math.sin(2 * Math.PI * percent) * RADIUS;
        return [x, y];
    };

    const makeArcPath = (startPercent: number, endPercent: number) => {
        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(endPercent);
        const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

        return [
            `M ${CENTER} ${CENTER}`,
            `L ${CENTER + startX} ${CENTER + startY}`,
            `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${CENTER + endX} ${CENTER + endY}`,
            `L ${CENTER} ${CENTER}`,
        ].join(' ');
    };

    const handleSpin = async () => {
        if (spinning || prizes.length === 0) return;
        setSpinning(true);
        setApiError(null);

        // START SPINNING IMMEDIATELY (Continuous loop while waiting)
        // We rotate indefinitely until the API returns
        const durationPerRotation = 800; // Fast spin
        rotation.value = withRepeat(
            withTiming(rotation.value + 360, { duration: durationPerRotation, easing: Easing.linear }),
            -1, // Infinite repeat
            false // No reverse
        );

        try {
            const res = await api.post('/auth/student/spin');

            if (res.data.success) {
                const wonPrize = res.data.prize;
                // Update Next Spin from response
                if (res.data.nextSpin) {
                    setNextSpin(new Date(res.data.nextSpin));
                }
                spinToPrize(wonPrize);
            } else {
                setApiError(res.data.error || "Spin unavailable");
                setSpinning(false);
                // Stop spinning
                rotation.value = rotation.value; // Freeze
            }
        } catch (e: any) {
            setSpinning(false);
            if (e.response?.data?.remainingMs) {
                // Handle late cooldown detection
                const next = new Date(Date.now() + e.response.data.remainingMs);
                setNextSpin(next);
                setApiError(null);
            } else {
                setApiError(e.response?.data?.error || "Connection error");
            }
            // Stop spinning
            rotation.value = rotation.value; // Freeze
        }
    };

    const spinToPrize = (wonPrize: any) => {
        const winnerIndex = prizes.findIndex(p => p.id === wonPrize.id);
        if (winnerIndex === -1) {
            setSpinning(false);
            return;
        }

        // 1. Calculate Landing Angle
        const segmentAngle = 360 / prizes.length;

        // Target: Center of segment at TOP (270deg)
        // If segment 0 starts at 0deg, its center is at segmentAngle/2.
        // We want that center to be at 270deg.
        // Required visual angle = 270 - centerAngleOfSegment.
        const centerAngleOfSegment = (winnerIndex * segmentAngle) + (segmentAngle / 2);

        // Calculate "offset" needed from 0 to align this segment to top
        let alignOffset = 270 - centerAngleOfSegment;

        // Add randomness
        const jitter = (Math.random() - 0.5) * (segmentAngle * 0.5);
        alignOffset += jitter;

        // 2. Smooth Transition from Infinite Spin
        // We are currently at `rotation.value` (approx).
        // Since we used withRepeat, the value might be resetting or growing. 
        // To be safe and smooth, we cancel the current animation and start a new one
        // that adds enough rotations to look good.

        // Read current rotation from the shared value (on JS thread this is allowed in Reanimated 2/3)
        // Note: withRepeat logic might make this tricky if it resets value 0->360. 
        // Just in case, let's assume we want to add 5 full spins + alignment.

        // Fix: Instead of reading potentially unstable value during withRepeat, 
        // we just start a "Landing" animation that adds a large fixed amount relative to "visual" 0?
        // No, that jumps.

        // Better Strategy involved in handleSpin:
        // Instead of withRepeat(0->360), Use a large cumulative value in handleSpin?
        // Actually, let's use the 'cancelAnimation' implicit behavior of setting a new value.

        // Current value might be e.g. 1450.
        // We want to land at (Multiple of 360) + alignOffset.
        // Let's find the next multiple of 360 that is > current + (360 * 5).

        let currentRot = rotation.value;
        const minRotations = 5;
        const targetMin = currentRot + (360 * minRotations);

        // Find the specific angle where (angle % 360) matches (alignOffset % 360)
        // standardizing alignOffset to 0-360 range
        let normalizedAlign = (alignOffset % 360);
        if (normalizedAlign < 0) normalizedAlign += 360;

        // We want T such that T > targetMin AND T % 360 == normalizedAlign
        // T = k * 360 + normalizedAlign

        let targetRotation = targetMin - (targetMin % 360) + normalizedAlign;
        if (targetRotation < targetMin) targetRotation += 360; // Ensure we go forward

        rotation.value = withTiming(targetRotation, {
            duration: 5000,
            easing: Easing.out(Easing.cubic),
        }, (finished) => {
            if (finished) {
                runOnJS(handleSpinEnd)(wonPrize);
            }
        });
    };

    const handleSpinEnd = (wonPrize: any) => {
        setSpinning(false);
        setResult(wonPrize);
        setTimeout(() => setShowResultModal(true), 600);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    const handleClaim = () => {
        setShowResultModal(false);
        onClose();
        if (result?.dealId) {
            router.push(`/deal/${result.dealId}`);
        }
    };

    const renderWheel = () => {
        if (!prizes || prizes.length === 0) return null;

        return (
            <Animated.View style={[animatedStyle, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}>
                <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                    <Defs>
                        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={COLORS.GOLD} stopOpacity="1" />
                            <Stop offset="1" stopColor="#8A6E36" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>

                    {/* Minimalist Border */}
                    <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="url(#goldGrad)" strokeWidth="4" />

                    {/* Segments */}
                    <G rotation={0} origin={`${CENTER}, ${CENTER}`} scale={0.96}>
                        {prizes.map((prize, index) => {
                            const segmentAngle = 360 / prizes.length;
                            const startAngle = index * segmentAngle;
                            const endAngle = (index + 1) * segmentAngle;
                            const startPercent = startAngle / 360;
                            const endPercent = endAngle / 360;

                            return (
                                <G key={prize.id}>
                                    <Path
                                        d={makeArcPath(startPercent, endPercent)}
                                        fill={index % 2 === 0 ? COLORS.NAVY : COLORS.DEEP_NAVY}
                                        stroke={COLORS.WHITE}
                                        strokeWidth="1"
                                    />
                                    <G
                                        rotation={(startAngle + endAngle) / 2}
                                        origin={`${CENTER}, ${CENTER}`}
                                    >
                                        <SvgText
                                            x={CENTER + RADIUS * 0.70}
                                            y={CENTER}
                                            fill={COLORS.WHITE}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            fontSize="13"
                                            fontWeight="bold"
                                            rotation={90}
                                            origin={`${CENTER + RADIUS * 0.70}, ${CENTER}`}
                                            letterSpacing="1"
                                        >
                                            {prize.name.replace("JACKPOT", "").trim().substring(0, 14)}
                                        </SvgText>
                                    </G>
                                </G>
                            );
                        })}
                    </G>

                    {/* White Center Hub */}
                    <Circle cx={CENTER} cy={CENTER} r={35} fill={COLORS.WHITE} stroke={COLORS.NAVY} strokeWidth="2" />
                </Svg>
            </Animated.View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !spinning && onClose()}>
            <View style={styles.overlay}>
                {/* Background Dimmer */}
                <View style={StyleSheet.absoluteFillObject} />

                {/* Close Button (Top Right, Elegant) */}
                {!spinning && !showResultModal && (
                    <SafeAreaView style={styles.closeButtonContainer}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.WHITE} />
                        </TouchableOpacity>
                    </SafeAreaView>
                )}

                {/* RESULT MODAL */}
                {showResultModal ? (
                    <View style={styles.resultModal}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultEmoji}>{result?.type === 'WIN' ? '✨' : '🍃'}</Text>
                        </View>

                        <Text style={styles.resultTitle}>
                            {result?.type === 'WIN' ? 'Congratulations' : 'Better Luck Next Time'}
                        </Text>

                        {/* Business Branding */}
                        {result?.type === 'WIN' && result?.business && (
                            <View style={styles.businessContainer}>
                                <Image
                                    source={{ uri: result.business.logo || undefined }}
                                    style={styles.businessLogo}
                                    contentFit="cover"
                                />
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.businessName}>{result.business.businessName}</Text>
                                    <Text style={styles.businessCity}>📍 {result.business.city}</Text>
                                </View>
                            </View>
                        )}

                        <Text style={styles.resultName}>
                            {result?.name}
                        </Text>

                        {result?.type === 'WIN' ? (
                            <TouchableOpacity onPress={handleClaim} style={styles.claimButton}>
                                <Text style={styles.claimButtonText}>Redeem Prize</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
                                <Text style={styles.closeModalText}>Close</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    // GAME UI
                    <View style={styles.gameContainer}>

                        {/* Title & Subtitle */}
                        <Text style={styles.brandTitle}>Spin & Win</Text>
                        <Text style={styles.brandSubtitle}>Exclusive Launch Prizes!</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.WHITE} style={{ marginVertical: 60 }} />
                        ) : apiError ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{apiError}</Text>
                                <TouchableOpacity onPress={fetchPrizes} style={styles.retryButton}>
                                    <Text style={styles.retryText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.wheelContainer}>
                                {/* Pointer (Inverted Triangle) */}
                                <View style={styles.pointerContainer}>
                                    <View style={styles.pointerTriangle} />
                                </View>

                                {renderWheel()}

                                {/* Center "Spin" Hub */}
                                <View style={styles.centerTextContainer} pointerEvents="none">
                                    <Text style={{ color: COLORS.RED, fontWeight: '900', fontSize: 15 }}>WIN</Text>
                                </View>
                            </View>
                        )}

                        {/* Controls */}
                        {!loading && !apiError && !showResultModal && (
                            <View>
                                {nextSpin ? (
                                    <View style={styles.cooldownContainer}>
                                        <Text style={styles.cooldownTitle}>Next Free Spin In</Text>
                                        <Text style={styles.cooldownTime}>{timeLeft}</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleSpin}
                                        disabled={spinning}
                                        style={[styles.spinButton, spinning && { opacity: 0.8 }]}
                                    >
                                        <Text style={styles.spinButtonText}>
                                            {spinning ? 'Spinning...' : 'SPIN NOW'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 50
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent circle
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    brandTitle: {
        color: COLORS.WHITE,
        fontSize: 32,
        fontWeight: '800', // Bold
        marginBottom: 4,
        textAlign: 'center',
    },
    brandSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 40,
        textAlign: 'center',
    },
    wheelContainer: {
        width: WHEEL_SIZE + 10,
        height: WHEEL_SIZE + 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    pointerContainer: {
        position: 'absolute',
        top: -14,
        zIndex: 100,
    },
    pointerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 14,
        borderRightWidth: 14,
        borderTopWidth: 24,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.RED,
    },
    centerTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinButton: {
        backgroundColor: COLORS.WHITE,
        paddingVertical: 16,
        paddingHorizontal: 50,
        borderRadius: 50,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Subtle shadow
        shadowRadius: 8,
        elevation: 8,
    },
    spinButtonText: {
        color: COLORS.RED,
        fontSize: 18,
        fontWeight: '900', // Extra bold
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    resultModal: {
        backgroundColor: COLORS.WHITE,
        width: '90%',
        padding: 32,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    resultHeader: {
        marginBottom: 16,
    },
    resultEmoji: {
        fontSize: 54,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.NAVY,
        marginBottom: 8,
    },
    resultName: {
        fontSize: 22,
        fontWeight: '500',
        color: COLORS.RED,
        textAlign: 'center',
        marginBottom: 24,
    },
    claimButton: {
        backgroundColor: COLORS.RED,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
    },
    claimButtonText: {
        color: COLORS.WHITE,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    closeModalButton: {
        paddingVertical: 12,
        width: '100%',
    },
    closeModalText: {
        color: COLORS.NAVY,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: 'rgba(255,50,50,0.2)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20
    },
    errorText: {
        color: COLORS.WHITE,
        marginBottom: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: COLORS.RED,
        fontWeight: 'bold',
    },
    cooldownContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    cooldownTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 1
    },
    cooldownTime: {
        color: COLORS.WHITE,
        fontSize: 24,
        fontWeight: '900',
        fontVariant: ['tabular-nums']
    },
    businessContainer: {
        alignItems: 'center',
        marginVertical: 12,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        width: '100%'
    },
    businessLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#eee'
    },
    businessName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.NAVY,
    },
    businessCity: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 2
    }
});
