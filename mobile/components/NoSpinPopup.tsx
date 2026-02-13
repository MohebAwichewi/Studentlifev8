import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface NoSpinPopupProps {
    visible: boolean;
    onClose: () => void;
}

export default function NoSpinPopup({ visible, onClose }: NoSpinPopupProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <View style={styles.backdrop} />

                {/* Content */}
                <View className="bg-white rounded-3xl w-[85%] max-w-sm p-8 items-center shadow-2xl">

                    {/* Icon Circle */}
                    <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-6 border-4 border-red-100">
                        <Ionicons name="gift-outline" size={36} color="#EF4444" />
                        <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-red-100">
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                        </View>
                    </View>

                    {/* Text Content */}
                    <Text className="text-2xl font-black text-slate-900 text-center mb-3">
                        No Spins Yet
                    </Text>

                    <Text className="text-slate-500 text-center text-base mb-8 leading-relaxed font-medium">
                        Sorry, there are no Spin & Win deals available right now. Please check back later!
                    </Text>

                    {/* Action Button */}
                    <TouchableOpacity
                        className="bg-red-500 w-full py-4 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all"
                        onPress={onClose}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-bold text-center text-lg tracking-wide">
                            Got it
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    }
});
