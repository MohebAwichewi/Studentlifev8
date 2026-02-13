import React, { useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity, Dimensions, Image, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const FILTERS = [
    { id: 'all', label: 'All Orders' },
    { id: 'paid', label: 'Paid' },
    { id: 'unpaid', label: 'Not Paid' },
    { id: 'expired', label: 'Expired' },
];

export default function WalletScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [filterStatus, setFilterStatus] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const { data: redemptions, isLoading, refetch } = useQuery({
        queryKey: ['my-tickets', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await api.get(`/auth/user/redemptions?userId=${user.id}`);
            return res.data.success ? res.data.redemptions : [];
        },
        enabled: !!user?.id
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Filter Logic
    const filteredTickets = redemptions?.filter((t: any) => {
        // Tab Logic (Mock 'used' field for history)
        if (activeTab === 'active' && t.used) return false;
        if (activeTab === 'history' && !t.used) return false;

        // Status Logic
        if (filterStatus === 'all') return true;

        // Mock Status: In real app, check t.status or t.paymentStatus
        if (filterStatus === 'paid') return t.paymentStatus === 'PAID';
        if (filterStatus === 'unpaid') return t.paymentStatus !== 'PAID';

        // Expired check
        if (filterStatus === 'expired') {
            const expiry = t.deal?.expiryDate ? new Date(t.deal.expiryDate).getTime() : null;
            return expiry && expiry < Date.now();
        }

        return true;
    }).sort((a: any, b: any) => {
        // Sort by Newest First
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) || [];

    const renderTicket = ({ item }: { item: any }) => (
        <View className="bg-white rounded-3xl mx-6 mb-6 overflow-hidden shadow-sm border border-slate-100">
            {/* Header: Order # and Shop */}
            <View className="bg-slate-50 p-4 border-b border-slate-100 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <View className="bg-white p-1 rounded-full border border-slate-200">
                        <Image
                            source={{ uri: item.deal?.business?.logo || 'https://via.placeholder.com/40' }}
                            className="w-8 h-8 rounded-full"
                        />
                    </View>
                    <View>
                        <Text className="font-bold text-slate-900 text-sm">{item.deal?.business?.businessName}</Text>
                        <Text className="text-slate-400 text-[10px] font-bold">#{item.code?.substring(0, 8)}</Text>
                    </View>
                </View>
                <View className={`px-2 py-1 rounded border ${item.paymentStatus === 'PAID' ? 'bg-green-100 border-green-200' : 'bg-orange-100 border-orange-200'}`}>
                    <Text className={`text-[10px] font-bold ${item.paymentStatus === 'PAID' ? 'text-green-700' : 'text-orange-700'}`}>
                        {item.paymentStatus === 'PAID' ? 'PAID' : 'PAY AT STORE'}
                    </Text>
                </View>
            </View>

            {/* Body: Deal Info */}
            <View className="p-4 flex-row items-center gap-4">
                <Image
                    source={{ uri: item.deal?.image || 'https://via.placeholder.com/80' }}
                    className="w-16 h-16 rounded-xl bg-slate-200"
                />
                <View className="flex-1">
                    <Text className="font-black text-slate-900 text-lg leading-tight mb-1">{item.deal?.title}</Text>
                    <Text className="text-slate-500 text-xs">Qty: {item.quantity || 1} • Total: {item.totalPrice || item.deal?.discountedPrice || 'Free'}</Text>
                </View>
            </View>

            {/* QR Section (Collapsible or visible) */}
            {activeTab === 'active' && (
                <View className="items-center pb-6">
                    <View className="bg-white p-2 rounded-xl border border-dashed border-slate-300">
                        <QRCode value={item.code || "ERR"} size={100} />
                    </View>
                    <Text className="text-slate-900 font-mono font-bold mt-2 tracking-widest">{item.code}</Text>
                </View>
            )}

            {/* Footer Actions */}
            <View className="flex-row border-t border-slate-100 divide-x divide-slate-100">
                <TouchableOpacity
                    className="flex-1 py-3 items-center bg-slate-50 active:bg-slate-100"
                    onPress={() => router.push({ pathname: '/deal/[id]', params: { id: item.dealId } })}
                >
                    <Text className="text-blue-600 font-bold text-xs">Reorder Deal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 py-3 items-center bg-slate-50 active:bg-slate-100"
                    onPress={() => { /* Open Receipt Logic */ }}
                >
                    <Text className="text-slate-500 font-bold text-xs">View Receipt</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50 pt-2">
            <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-slate-100 shadow-sm z-10">
                <Text className="text-2xl font-black text-slate-900">My Orders</Text>
                <TouchableOpacity className="bg-slate-100 p-2 rounded-full">
                    <Ionicons name="filter" size={20} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Tabs (Active vs History) */}
            <View className="bg-white px-6 pb-4 shadow-sm z-0 mb-4">
                <View className="flex-row bg-slate-100 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setActiveTab('active')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'active' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold text-xs ${activeTab === 'active' ? 'text-slate-900' : 'text-slate-500'}`}>Active Tickets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('history')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'history' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold text-xs ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-500'}`}>Redemption History</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Filters (Horizontal) */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 8 }}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f.id}
                            onPress={() => setFilterStatus(f.id)}
                            className={`px-4 py-1.5 rounded-full border ${filterStatus === f.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`text-xs font-bold ${filterStatus === f.id ? 'text-white' : 'text-slate-600'}`}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={filteredTickets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTicket}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20 px-10">
                            <FontAwesome5 name="receipt" size={48} color="#cbd5e1" />
                            <Text className="text-slate-900 font-bold mt-4 text-center">No orders found</Text>
                            <Text className="text-slate-400 text-center mt-2 text-xs">
                                {activeTab === 'active' ? "Your active tickets will appear here." : "Your past orders and redemptions activity."}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
