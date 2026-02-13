import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function TicketScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const dealTitle = params.dealTitle || "Deal Claimed";
    const businessName = params.businessName || "Partner Store";
    const code = params.code as string || "INVALID-CODE";
    const dealId = params.dealId || "0";

    // Security Payload: {userId}:{dealId}:{timestamp}:{code}
    const timestamp = Date.now();
    const qrPayload = `${user?.id || 'uid'}:${dealId}:${timestamp}:${code}`;

    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        (async () => {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === 'granted') {
                setHasPermission(true);
                await Brightness.setBrightnessAsync(1);
            }
        })();

        return () => {
            if (hasPermission) {
                Brightness.restoreSystemBrightnessAsync();
            }
        };
    }, []);

    const handleDone = () => {
        // Reset brightness just in case
        if (hasPermission) Brightness.restoreSystemBrightnessAsync();
        // Go to Users Wallet (Orders)
        router.replace('/(tabs)/wallet');
    };

    const openMaps = () => {
        // Fallback or use real coordinates if passed, for now generic search
        const query = encodeURIComponent(businessName as string);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`
        });
        if (url) Linking.openURL(url);
    };

    // Format Date
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>

                {/* Success Banner */}
                <View className="flex-row items-center justify-center mb-8 mt-12 gap-2">
                    <View className="bg-green-500 rounded-full p-1">
                        <FontAwesome5 name="check" size={12} color="white" />
                    </View>
                    <Text className="text-white font-bold text-lg tracking-widest uppercase">Order Confirmed</Text>
                </View>

                <View style={styles.ticketCard}>
                    {/* Header */}
                    <View style={styles.ticketHeader}>
                        <Text style={styles.businessName}>{businessName}</Text>
                        <Text style={styles.dealTitle} numberOfLines={2}>{dealTitle}</Text>
                        <Text className="text-slate-400 text-xs mt-1 font-bold">#{code}</Text>
                    </View>

                    {/* QR Code Section */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrPayload}
                            size={220}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>

                    {/* Code Text */}
                    <View style={styles.codeBox}>
                        <Text style={styles.codeLabel}>BACKUP CODE</Text>
                        <Text style={styles.codeValue}>{code}</Text>
                    </View>

                    <Text style={styles.instruction}>Scan this code at the checkout</Text>

                    {/* Validity Timer (Mock) */}
                    <View className="mt-4 flex-row items-center gap-2">
                        <FontAwesome5 name="clock" size={12} color="#ef4444" />
                        <Text className="text-red-500 font-bold text-xs">Valid for 15 minutes</Text>
                    </View>

                </View>

                {/* Footer Info */}
                <View style={styles.footer}>
                    {/* Directions Button */}
                    <TouchableOpacity onPress={openMaps} className="flex-row items-center gap-2 mb-6 opacity-80">
                        <FontAwesome5 name="map-marker-alt" size={14} color="#94a3b8" />
                        <Text className="text-slate-400 font-bold underline">Get Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={handleDone}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
    ticketCard: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: 350,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    ticketHeader: {
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        width: '100%',
        paddingBottom: 16,
    },
    businessName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    dealTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 24,
    },
    codeBox: {
        backgroundColor: '#f8fafc',
        width: '100%',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 4,
    },
    codeValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        fontVariant: ['tabular-nums'],
    },
    instruction: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        width: '100%',
    },
    doneButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        paddingHorizontal: 64,
        borderRadius: 999,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        width: '100%',
        alignItems: 'center',
    },
    doneButtonText: {
        color: 'white',
        fontWeight: 'black',
        fontSize: 18,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
