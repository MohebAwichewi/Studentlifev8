import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Notification Types & Icons
type NotificationType = 'new_deal' | 'expiring' | 'flash_deal' | 'order' | 'new_shop' | 'summary' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    targetId?: string; // ID to navigate to (dealId, orderId, etc.)
    data?: any;
}

// MOCK DATA
const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'flash_deal',
        title: '⚡ Flash Sale Alert!',
        message: '50% OFF at Burger King for the next 2 hours only!',
        time: '2m ago',
        read: false,
        targetId: '101'
    },
    {
        id: '2',
        type: 'expiring',
        title: '⏳ Deal Expiring Soon',
        message: 'Your saved deal at Spa Wellness expires in 24 hours.',
        time: '1h ago',
        read: false,
        targetId: '102'
    },
    {
        id: '3',
        type: 'order',
        title: '🎟️ Ticket Ready',
        message: 'Your order #12345 has been confirmed. View ticket now.',
        time: '3h ago',
        read: true,
        targetId: 'ticket_123'
    },
    {
        id: '4',
        type: 'new_deal',
        title: '❤️ New Deal from Zara',
        message: 'Zara just posted a new collection offer: 20% OFF.',
        time: '5h ago',
        read: true,
        targetId: '103'
    },
    {
        id: '5',
        type: 'new_shop',
        title: '🏪 New Shop Nearby',
        message: 'TechStore just joined WIN! Check out their opening offers.',
        time: '1d ago',
        read: true,
        targetId: 'shop_456'
    },
    {
        id: '6',
        type: 'summary',
        title: '📊 Weekly Summary',
        message: 'You saved 45 TND this week! Click to see your stats.',
        time: '2d ago',
        read: true,
        targetId: 'stats'
    }
];

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'new_deal': return <Ionicons name="heart" size={20} color="#ef4444" />;
        case 'expiring': return <Ionicons name="time" size={20} color="#f97316" />;
        case 'flash_deal': return <Ionicons name="flash" size={20} color="#eab308" />;
        case 'order': return <FontAwesome5 name="ticket-alt" size={18} color="#3b82f6" />;
        case 'new_shop': return <FontAwesome5 name="store" size={16} color="#8b5cf6" />;
        case 'summary': return <Ionicons name="stats-chart" size={20} color="#10b981" />;
        default: return <Ionicons name="notifications" size={20} color="#64748b" />;
    }
};

const getBgColor = (type: NotificationType) => {
    switch (type) {
        case 'flash_deal': return 'bg-yellow-50 border-yellow-100';
        case 'expiring': return 'bg-orange-50 border-orange-100';
        default: return 'bg-white border-slate-100';
    }
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

    // Filter Logic if needed, for now just show all sorted by mock time logic (index)

    const handlePress = (notif: Notification) => {
        // Mark as read
        if (!notif.read) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        }

        // Navigate
        switch (notif.type) {
            case 'flash_deal':
            case 'new_deal':
            case 'expiring':
                if (notif.targetId) router.push({ pathname: '/deal/[id]', params: { id: notif.targetId } });
                break;
            case 'order':
                router.push('/wallet');
                break;
            case 'new_shop':
                // navigate to shop profile (mock functionality for now, maybe map or deal)
                router.push('/explore');
                break;
            default:
                break;
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            "Clear All Notifications?",
            "This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => setNotifications([])
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
            className={`flex-row items-start p-4 mb-3 rounded-2xl border ${item.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}
        >
            {/* Icon Circle */}
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 bg-white border border-slate-100 shadow-sm`}>
                {getIcon(item.type)}
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className={`text-sm font-bold flex-1 mr-2 ${item.read ? 'text-slate-900' : 'text-slate-900'}`}>
                        {item.title}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400">{item.time}</Text>
                </View>
                <Text className={`text-xs mt-1 leading-relaxed ${item.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {item.message}
                </Text>
            </View>

            {/* Unread Dot */}
            {!item.read && (
                <View className="w-2 h-2 rounded-full bg-blue-500 absolute top-4 right-4" />
            )}
        </TouchableOpacity>
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();

    // Connect to backend notifications endpoint
    const { data: notifications, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/auth/student/notifications');
            return res.data.success ? res.data.notifications : [];
        }
    });

    // Refresh on focus
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-4">
                        <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-slate-900">Notifications</Text>
                </View>

                <View className="flex-row items-center gap-2">
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={handleClearAll} className="px-3 py-1.5 rounded-full bg-slate-100">
                            <Text className="text-xs font-bold text-slate-600">Clear All</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => router.push('/user/notifications')}
                        className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
                    >
                        <Ionicons name="settings-sharp" size={20} color="#0f172a" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
                        <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
                    </View>
                    <Text className="text-lg font-bold text-slate-900 text-center">No New Notifications</Text>
                    <Text className="text-slate-400 text-center mt-2 leading-relaxed">
                        You're all caught up! Check back later for exclusive deals and updates.
                    </Text>
                </View>
            )}
            <View className="px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-4">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Notifications</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#E63946" />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color="#E63946" className="mt-10" />
                ) : notifications && notifications.length > 0 ? (
                    notifications.map((notif: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                if (notif.dealId) router.push(`/deal/${notif.dealId}`);
                            }}
                            className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-row gap-4"
                        >
                            <View className={`w-2 h-2 rounded-full mt-2 ${notif.isRead ? 'bg-slate-300' : 'bg-blue-500'}`} />
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900">{notif.title}</Text>
                                <Text className="text-slate-500 text-xs mt-1">{notif.message}</Text>
                                {notif.type === 'WIN' && (
                                    <Text className="text-emerald-600 font-bold text-xs mt-2">Tap to Claim Prize →</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="items-center justify-center mt-20">
                        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                            <Ionicons name="notifications" size={20} color="#E63946" />
                        </View>
                        <Text className="text-lg font-bold text-slate-900">No New Notifications</Text>
                        <Text className="text-slate-400 text-center mt-2 px-10 leading-relaxed">
                            You're all caught up! Check back later for exclusive deals and updates.
                        </Text>
                    </View>
                )}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
