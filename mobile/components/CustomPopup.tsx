import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface CustomPopupProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export default function CustomPopup({ visible, title, message, onClose }: CustomPopupProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
                    {/* Title */}
                    <Text className="text-xl font-bold text-slate-900 text-center mb-3">
                        {title}
                    </Text>

                    {/* Message */}
                    <Text className="text-slate-600 text-center text-base mb-8 leading-relaxed">
                        {message}
                    </Text>

                    {/* OK Button */}
                    <TouchableOpacity
                        className="bg-primary py-3.5 rounded-xl w-full active:opacity-90"
                        onPress={onClose}
                    >
                        <Text className="text-white font-bold text-center text-lg">
                            OK
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
