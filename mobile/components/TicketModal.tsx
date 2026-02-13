import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface TicketModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPayAtStore: () => void;
    dealTitle: string;
    businessName: string;
}

export default function TicketModal({ visible, onClose, onSelectPayAtStore, dealTitle, businessName }: TicketModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-t-3xl p-6 pb-12 shadow-2xl">
                            {/* Handle Bar */}
                            <View className="items-center mb-6">
                                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </View>

                            <Text className="text-xl font-bold text-slate-900 text-center mb-1">
                                Get this Deal
                            </Text>
                            <Text className="text-slate-500 text-center mb-8 text-sm">
                                {dealTitle} • {businessName}
                            </Text>

                            <Text className="text-slate-900 font-bold mb-4 uppercase text-xs tracking-wider">
                                Select Payment Method
                            </Text>

                            {/* Pay at Store Option */}
                            <TouchableOpacity
                                onPress={onSelectPayAtStore}
                                className="flex-row items-center p-4 border border-slate-200 rounded-xl bg-slate-50 mb-4 active:bg-slate-100"
                            >
                                <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-slate-100 mr-4">
                                    <FontAwesome5 name="store" size={20} color="#0f172a" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-black text-base">Pay at Store</Text>
                                    <Text className="text-slate-500 text-xs">Show ticket to cashier</Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={14} color="#94a3b8" />
                            </TouchableOpacity>

                            {/* Future Payment Options (Placeholder) */}
                            <View className="flex-row items-center p-4 border border-slate-100 rounded-xl bg-white opacity-50">
                                <View className="w-12 h-12 bg-slate-50 rounded-full items-center justify-center border border-slate-100 mr-4">
                                    <FontAwesome5 name="credit-card" size={20} color="#cbd5e1" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 font-bold text-base">Online Payment</Text>
                                    <Text className="text-slate-400 text-xs">Coming soon</Text>
                                </View>
                            </View>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={onClose}
                                className="mt-8 py-3 w-full items-center"
                            >
                                <Text className="text-slate-900 font-bold">Cancel</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
