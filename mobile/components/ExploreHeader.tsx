import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ExploreHeaderProps {
    onSearch: (query: string) => void;
    city: string;
    setCity: (city: string) => void;
    onFocusSearch?: () => void;
}

const MOCK_LOCATIONS = ["Current Location", "Tunis", "Sfax", "Sousse", "Bizerte", "Ariana"];

const ExploreHeader = ({ onSearch, city, setCity, onFocusSearch }: ExploreHeaderProps) => {
    const [showLocationModal, setShowLocationModal] = useState(false);

    const handleSelectLocation = (loc: string) => {
        setCity(loc === "Current Location" ? "Tunis" : loc); // Mock "Current Location" logic for now
        setShowLocationModal(false);
    };

    return (
        <SafeAreaView edges={['top']} className="bg-white shadow-sm shadow-slate-100 z-10 pt-2">
            <View className="px-6 pb-4 bg-white">
                {/* 3-Part Smart Search Input */}
                <View className="bg-white rounded-2xl shadow-sm shadow-slate-200 border border-slate-200 overflow-hidden">

                    {/* Part 1: Where? */}
                    <TouchableOpacity
                        onPress={() => setShowLocationModal(true)}
                        className="flex-row items-center px-4 py-3 border-b border-slate-100 active:bg-slate-50"
                    >
                        <FontAwesome5 name="map-marker-alt" size={16} color="#0f172a" />
                        <View className="ml-3 flex-1">
                            <Text className="text-xs text-slate-400 font-bold uppercase">Where?</Text>
                            <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>{city || 'Current Location'}</Text>
                        </View>
                        <FontAwesome5 name="chevron-down" size={12} color="#94a3b8" />
                    </TouchableOpacity>

                    {/* Part 2: What? */}
                    <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                        <Ionicons name="search" size={20} color="#ef4444" />
                        <TextInput
                            className="ml-3 flex-1 font-bold text-slate-900 text-sm h-full"
                            placeholder="What are you looking for?"
                            placeholderTextColor="#94a3b8"
                            onChangeText={onSearch}
                            onFocus={onFocusSearch}
                        />
                    </View>

                    {/* Part 3: How Much? (Mock for UI) */}
                    <TouchableOpacity className="flex-row items-center px-4 py-3 bg-slate-50">
                        <FontAwesome5 name="wallet" size={14} color="#64748b" />
                        <Text className="ml-3 text-slate-500 font-bold text-xs flex-1">Any Budget</Text>
                        <View className="bg-white border border-slate-200 rounded px-2 py-1">
                            <Text className="text-[10px] font-bold text-slate-500">Filters</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </View>

            {/* Location Modal */}
            <Modal visible={showLocationModal} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setShowLocationModal(false)}>
                    <View className="flex-1 bg-black/50 justify-center px-6">
                        <TouchableWithoutFeedback>
                            <View className="bg-white rounded-3xl p-4 shadow-xl">
                                <Text className="text-lg font-black text-slate-900 mb-4 px-2">Select Location</Text>
                                <FlatList
                                    data={MOCK_LOCATIONS}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => handleSelectLocation(item)}
                                            className="py-4 border-b border-slate-100 flex-row items-center"
                                        >
                                            <FontAwesome5
                                                name={item === "Current Location" ? "location-arrow" : "map-marker-alt"}
                                                size={16}
                                                color={item === "Current Location" ? "#ef4444" : "#64748b"}
                                                style={{ width: 24 }}
                                            />
                                            <Text className={`ml-3 font-bold ${item === "Current Location" ? "text-red-500" : "text-slate-700"}`}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

export default ExploreHeader;
