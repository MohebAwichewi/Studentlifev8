import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

// Mock Data for Shops (In reality, we'd fetch details for IDs in user.follows)
const MOCK_SHOPS = [
    {
        id: 'shop_1',
        name: 'Burger King',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png',
        category: 'Fast Food',
        activeDeals: 3,
        cover: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'
    },
    {
        id: 'shop_2',
        name: 'Zara',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1024px-Zara_Logo.svg.png',
        category: 'Fashion',
        activeDeals: 1,
        cover: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        id: 'shop_3',
        name: 'California Gym',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/502px-Logo_of_YouTube_%282015-2017%29.svg.png', // Placeholder
        category: 'Fitness',
        activeDeals: 0,
        cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
];

export default function FollowingScreen() {
    const router = useRouter();
    const { following, toggleFollow } = useAuth();

    // Filter MOCK_SHOPS based on 'following' IDs (simulated)
    // For demo purposes, we'll initialize state with MOCK_SHOPS
    // In a real app: const displayedShops = allShops.filter(s => following.includes(s.id));
    const [displayedShops, setDisplayedShops] = useState(MOCK_SHOPS);

    const handleUnfollow = (shopId: string, shopName: string) => {
        Alert.alert(
            `Unfollow ${shopName}?`,
            "You will stop receiving alerts for new deals.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unfollow",
                    style: "destructive",
                    onPress: () => {
                        // Optimistic Update
                        setDisplayedShops(prev => prev.filter(s => s.id !== shopId));
                        // Call Context (if real ID matches)
                        // toggleFollow(shopId); 

                        // Show "Toast" (Alert for now)
                        Alert.alert("Shop Unfollowed", "", [{
                            text: "Undo", onPress: () => {
                                // Undo Logic would go here
                                const shop = MOCK_SHOPS.find(s => s.id === shopId);
                                if (shop) setDisplayedShops(prev => [...prev, shop]);
                            }
                        }]);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof MOCK_SHOPS[0] }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/business/${item.id}`)}
            className="bg-white mb-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
        >
            {/* Cover Image Header */}
            <View className="h-24 relative">
                <Image source={{ uri: item.cover }} className="w-full h-full opacity-90" resizeMode="cover" />
                <View className="absolute inset-0 bg-black/30" />

                {/* Status Badge */}
                <View className="absolute top-3 right-3 flex-row items-center bg-white/90 px-2 py-1 rounded-full backdrop-blur-sm">
                    <View className={`w-2 h-2 rounded-full mr-1.5 ${item.activeDeals > 0 ? 'bg-green-500' : 'bg-slate-400'}`} />
                    <Text className={`text-[10px] font-bold ${item.activeDeals > 0 ? 'text-green-700' : 'text-slate-500'}`}>
                        {item.activeDeals > 0 ? `${item.activeDeals} Active Deals` : 'No active deals'}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View className="px-4 pb-4 -mt-8 flex-row items-end justify-between">
                <View className="flex-row items-end flex-1 mr-4">
                    {/* Logo */}
                    <View className="w-16 h-16 bg-white rounded-full border-2 border-white items-center justify-center shadow-sm overflow-hidden mr-3">
                        <Image source={{ uri: item.logo }} className="w-full h-full" resizeMode="cover" />
                    </View>

                    {/* Text */}
                    <View className="mb-1 flex-1">
                        <Text className="text-lg font-black text-slate-900 leading-tight">{item.name}</Text>
                        <Text className="text-slate-500 text-xs font-bold">{item.category}</Text>
                    </View>
                </View>

                {/* Following Button */}
                <TouchableOpacity
                    onPress={() => handleUnfollow(item.id, item.name)}
                    className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200 mb-1"
                >
                    <Text className="text-xs font-bold text-slate-700">Following</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100 bg-white z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Followed Shops</Text>
            </View>

            {displayedShops.length > 0 ? (
                <FlatList
                    data={displayedShops}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 items-center justify-center p-10">
                    <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
                        <FontAwesome5 name="store-alt" size={40} color="#cbd5e1" />
                    </View>
                    <Text className="text-xl font-black text-slate-900 text-center mb-2">No Shops Yet</Text>
                    <Text className="text-slate-400 text-center leading-relaxed mb-8">
                        Follow your favorite places to get notified instantly when they post new deals.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/search')}
                        className="bg-slate-900 px-8 py-4 rounded-xl w-full"
                    >
                        <Text className="text-white font-bold text-center">Discover Local Shops</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
