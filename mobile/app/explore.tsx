import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Category Data with Icons and Mock Counts
const CATEGORIES = [
    { id: 'eat_drink', name: 'Eat & Drink', icon: 'utensils', type: 'fa5', color: '#fca5a5', count: 42, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500' },
    { id: 'wellness', name: 'Wellness', icon: 'spa', type: 'fa5', color: '#86efac', count: 18, image: 'https://images.unsplash.com/photo-1600334089648-b0d9c3028eb2?w=500' },
    { id: 'retail', name: 'Retail', icon: 'shopping-bag', type: 'fa5', color: '#93c5fd', count: 25, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500' },
    { id: 'services', name: 'Services', icon: 'tools', type: 'fa5', color: '#cbd5e1', count: 12, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500' },
    { id: 'entertainment', name: 'Entertainment', icon: 'gamepad', type: 'fa5', color: '#c4b5fd', count: 9, image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500' },
    { id: 'fitness', name: 'Fitness', icon: 'dumbbell', type: 'fa5', color: '#fdba74', count: 15, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' },
    { id: 'homes', name: 'Homes', icon: 'home', type: 'fa5', color: '#d8b4fe', count: 5, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' },
    { id: 'electronics', name: 'Electronics', icon: 'mobile-alt', type: 'fa5', color: '#9ca3af', count: 8, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500' },
    { id: 'beauty', name: 'Beauty', icon: 'cut', type: 'fa5', color: '#f9a8d4', count: 22, image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=500' },
    { id: 'education', name: 'Education', icon: 'graduation-cap', type: 'fa5', color: '#fde047', count: 3, image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500' },
    { id: 'automotive', name: 'Automotive', icon: 'car', type: 'fa5', color: '#ef4444', count: 7, image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500' },
    { id: 'other', name: 'Other', icon: 'ellipsis-h', type: 'fa5', color: '#e2e8f0', count: 0, image: null },
];

export default function ExploreScreen() {
    const router = useRouter();

    const handlePress = (categoryId: string) => {
        router.push({ pathname: '/search', params: { category: categoryId } });
    };

    const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isDisabled = item.count === 0;

        return (
            <TouchableOpacity
                onPress={() => !isDisabled && handlePress(item.id)}
                activeOpacity={0.7}
                disabled={isDisabled}
                className={`flex-1 m-2 h-40 rounded-3xl overflow-hidden relative shadow-sm shadow-slate-200 bg-white ${isDisabled ? 'opacity-50' : ''}`}
            >
                {item.image ? (
                    <Image source={{ uri: item.image }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="absolute inset-0 w-full h-full bg-slate-100" />
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    className="absolute inset-0 z-10"
                />

                <View className="absolute inset-0 z-20 p-4 justify-between">
                    <View className="self-end">
                        {item.count > 0 ? (
                            <View className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg">
                                <Text className="text-[10px] font-black text-slate-900">{item.count} Active</Text>
                            </View>
                        ) : (
                            <View className="bg-slate-200/90 px-2 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-slate-500">Coming Soon</Text>
                            </View>
                        )}
                    </View>

                    <View>
                        <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 bg-white/20 backdrop-blur-md border border-white/30`}>
                            <FontAwesome5 name={item.icon} size={16} color="white" />
                        </View>
                        <Text className="text-white font-black text-lg leading-none shadow-sm">{item.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-slate-900">Explore</Text>
            </View>

            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
