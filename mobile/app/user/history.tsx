import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HistoryScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/user/history?userId=${user?.id}`);
            if (res.data.success) {
                setHistory(res.data.history);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <SafeAreaView className="flex-1 justify-center items-center bg-white"><ActivityIndicator /></SafeAreaView>;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Redemption History</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ padding: 24 }}
                renderItem={({ item }: { item: any }) => (
                    <View className="flex-row items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Image
                            source={{ uri: item.deal.business.logo || 'https://via.placeholder.com/50' }}
                            className="w-12 h-12 rounded-full mr-4 bg-white"
                        />
                        <View className="flex-1">
                            <Text className="font-bold text-slate-900">{item.deal.title}</Text>
                            <Text className="text-slate-500 text-xs">{item.deal.business.businessName}</Text>
                            <Text className="text-xs text-slate-400 mt-1">Redeemed on {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-emerald-600 font-black">{item.deal.discount}</Text>
                            <View className="bg-slate-200 px-2 py-1 rounded mt-1">
                                <Text className="text-[10px] font-bold text-slate-600">USED</Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <FontAwesome5 name="history" size={40} color="#cbd5e1" />
                        <Text className="text-slate-400 font-bold mt-4">No history yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
