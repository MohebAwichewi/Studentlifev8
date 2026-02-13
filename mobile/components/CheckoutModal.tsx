import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (quantity: number, paymentMethod: string) => void;
    dealTitle: string;
    businessName: string;
    price: number;
    discountedPrice?: number;
    image?: string;
    loading?: boolean;
}

export default function CheckoutModal({
    visible,
    onClose,
    onConfirm,
    dealTitle,
    businessName,
    price,
    discountedPrice,
    image,
    loading = false
}: CheckoutModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'store' | 'online'>('store');

    // Reset on open
    useEffect(() => {
        if (visible) {
            setQuantity(1);
            setPaymentMethod('store');
        }
    }, [visible]);

    const unitPrice = discountedPrice !== undefined ? discountedPrice : price;
    const total = unitPrice * quantity;
    const savings = (price - unitPrice) * quantity;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/60 justify-end">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-t-3xl h-[85%] shadow-2xl flex-col">

                            {/* Header */}
                            <View className="items-center pt-4 pb-2 border-b border-slate-100">
                                <View className="w-12 h-1.5 bg-slate-200 rounded-full mb-4" />
                                <Text className="text-lg font-black text-slate-900">Checkout</Text>
                            </View>

                            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                                {/* Deal Summary Card */}
                                <View className="flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <Image
                                        source={{ uri: image || 'https://via.placeholder.com/100' }}
                                        className="w-20 h-20 rounded-xl bg-slate-200"
                                    />
                                    <View className="flex-1 justify-center">
                                        <Text className="text-xs text-slate-500 font-bold uppercase mb-1">{businessName}</Text>
                                        <Text className="text-slate-900 font-black text-base leading-tight mb-2" numberOfLines={2}>{dealTitle}</Text>
                                        <Text className="text-emerald-600 font-bold">{unitPrice > 0 ? `${unitPrice} DT` : 'Free'}</Text>
                                    </View>
                                </View>

                                {/* Quantity Selector */}
                                <Text className="text-slate-900 font-bold mb-4">Quantity</Text>
                                <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                                    <Text className="text-slate-500 font-medium">How many items?</Text>
                                    <View className="flex-row items-center gap-4 bg-white rounded-lg border border-slate-200 p-1">
                                        <TouchableOpacity
                                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 items-center justify-center bg-slate-100 rounded"
                                        >
                                            <FontAwesome5 name="minus" size={12} color="#64748b" />
                                        </TouchableOpacity>
                                        <Text className="text-slate-900 font-black text-lg w-6 text-center">{quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="w-8 h-8 items-center justify-center bg-slate-900 rounded"
                                        >
                                            <FontAwesome5 name="plus" size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Payment Method */}
                                <Text className="text-slate-900 font-bold mb-4">Payment Method</Text>
                                <View className="gap-3 mb-8">
                                    <TouchableOpacity
                                        onPress={() => setPaymentMethod('store')}
                                        className={`flex-row items-center p-4 border rounded-xl ${paymentMethod === 'store' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <View className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${paymentMethod === 'store' ? 'border-blue-500' : 'border-slate-300'}`}>
                                            {paymentMethod === 'store' && <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                        </View>
                                        <FontAwesome5 name="store" size={16} color={paymentMethod === 'store' ? '#2563eb' : '#64748b'} style={{ width: 24, textAlign: 'center' }} />
                                        <View className="flex-1 ml-3">
                                            <Text className={`font-bold ${paymentMethod === 'store' ? 'text-blue-900' : 'text-slate-900'}`}>Pay at Store</Text>
                                            <Text className="text-slate-500 text-xs">Show ticket to cashier</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        disabled={true} // Disabled for now
                                        className="flex-row items-center p-4 border border-slate-100 rounded-xl bg-slate-50 opacity-60"
                                    >
                                        <View className="w-5 h-5 rounded-full border border-slate-300 items-center justify-center mr-3" />
                                        <FontAwesome5 name="credit-card" size={16} color="#cbd5e1" style={{ width: 24, textAlign: 'center' }} />
                                        <View className="flex-1 ml-3">
                                            <Text className="font-bold text-slate-400">Pay Online</Text>
                                            <Text className="text-slate-400 text-xs">Coming Soon</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Variation Selector (Placeholder logic if needed) */}
                                {/* ... */}

                            </ScrollView>

                            {/* Footer Summary */}
                            <View className="p-6 bg-white border-t border-slate-100 shadow-2xl safe-bottom">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-slate-500">Subtotal</Text>
                                    <Text className="text-slate-900 font-bold">{total > 0 ? `${total.toFixed(2)} DT` : 'Free'}</Text>
                                </View>
                                {savings > 0 && (
                                    <View className="flex-row justify-between mb-6">
                                        <Text className="text-emerald-600 text-xs">You save</Text>
                                        <Text className="text-emerald-600 font-bold text-xs">-{savings.toFixed(2)} DT</Text>
                                    </View>
                                )}

                                <View className="flex-row justify-between items-center mb-6 pt-4 border-t border-dashed border-slate-200">
                                    <Text className="text-slate-900 font-black text-xl">Total</Text>
                                    <Text className="text-slate-900 font-black text-2xl">{total > 0 ? `${total.toFixed(2)} DT` : 'Free'}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => onConfirm(quantity, paymentMethod)}
                                    disabled={loading}
                                    className="bg-slate-900 py-4 rounded-xl items-center shadow-lg shadow-slate-400"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-black text-lg">Confirm Purchase</Text>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-center text-[10px] text-slate-400 mt-3 px-8">
                                    By confirming, you agree to the Terms of Service. This deal is non-refundable once redeemed.
                                </Text>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
