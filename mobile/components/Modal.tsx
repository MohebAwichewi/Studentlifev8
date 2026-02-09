import React from 'react';
import { View, Modal as RNModal, TouchableOpacity, Text, ModalProps } from 'react-native';

interface CustomModalProps extends Partial<ModalProps> {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export default function Modal({ visible, onClose, children, title, ...props }: CustomModalProps) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            {...props}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                    {title && (
                        <Text className="text-2xl font-black text-slate-900 mb-4">{title}</Text>
                    )}
                    {children}
                </View>
            </View>
        </RNModal>
    );
}
