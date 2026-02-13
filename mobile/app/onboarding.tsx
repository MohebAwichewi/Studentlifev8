import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Find deals near you',
        description: 'Discover the best offers from local businesses around your university.',
        icon: 'map-marked-alt',
        lib: FontAwesome5,
        color: '#ef4444' // Brand Red
    },
    {
        id: '2',
        title: 'Save money daily',
        description: 'Get exclusive discounts on food, fashion, and experiences.',
        icon: 'piggy-bank',
        lib: FontAwesome5,
        color: '#ef4444'
    },
    {
        id: '3',
        title: 'Support local shops',
        description: 'Help your community thrive by shopping at your favorite local spots.',
        icon: 'store',
        lib: FontAwesome5,
        color: '#ef4444'
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('has_seen_onboarding', 'true');
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            // Fallback navigation even if storage fails
            router.replace('/(auth)/login');
        }
    };

    const handleSkip = handleFinish;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleFinish();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }: any) => {
        const IconLib = item.lib;
        return (
            <View style={{ width }} className="items-center justify-center px-8">
                <View className="w-64 h-64 bg-red-100 rounded-full items-center justify-center mb-10 shadow-sm">
                    <IconLib name={item.icon} size={100} color="#ef4444" />
                </View>
                <Text className="text-3xl font-black text-slate-900 text-center mb-4">
                    {item.title}
                </Text>
                <Text className="text-base text-slate-500 text-center leading-relaxed">
                    {item.description}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">

                {/* Header / Skip Button */}
                <View className="flex-row justify-end px-6 py-4 h-16">
                    {currentIndex < SLIDES.length - 1 && (
                        <TouchableOpacity onPress={handleSkip}>
                            <Text className="text-slate-400 font-bold text-base">Skip</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                    scrollEventThrottle={32}
                />

                {/* Bottom Controls */}
                <View className="h-40 px-8 justify-between pb-8">
                    {/* Pagination Dots */}
                    <View className="flex-row justify-center space-x-2 mb-6">
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-8 bg-red-500' : 'w-2 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </View>

                    {/* Button */}
                    {currentIndex === SLIDES.length - 1 ? (
                        <TouchableOpacity
                            onPress={handleFinish}
                            className="w-full bg-[#ef4444] py-4 rounded-full items-center shadow-md shadow-red-200"
                        >
                            <Text className="text-white font-bold text-lg">Get Started</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleNext}
                            className="w-full bg-slate-900 py-4 rounded-full items-center"
                        >
                            <Text className="text-white font-bold text-lg">Next</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
