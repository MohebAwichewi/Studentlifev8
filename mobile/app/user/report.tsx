import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ReportProblemScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // Form State
    const [category, setCategory] = useState<string | null>(null);
    const [reference, setReference] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CATEGORIES = [
        'Deal Refused',
        'Shop Closed',
        'Price Mismatch',
        'App Bug',
        'Other'
    ];

    const handleSubmit = async () => {
        if (!category) {
            Alert.alert("Missing Information", "Please select a category for your report.");
            return;
        }
        if (!message.trim()) {
            Alert.alert("Missing Information", "Please describe the issue in detail.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API Call
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                "Report Submitted",
                "Thank you for flagging this. Our team will review your report and get back to you within 24 hours.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100 bg-white">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                        <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-slate-900">Report a Problem</Text>
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>

                    <Text className="text-slate-500 mb-6 leading-relaxed">
                        We take quality seriously. Please provide as much detail as possible so we can resolve this quickly.
                    </Text>

                    {/* Category Selection */}
                    <Text className="text-xs font-bold text-slate-900 uppercase mb-3">What went wrong?</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold text-sm ${category === cat ? 'text-white' : 'text-slate-600'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Reference ID (Optional) */}
                    <Text className="text-xs font-bold text-slate-900 uppercase mb-3">Order / Deal Reference (Optional)</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 font-bold text-slate-900"
                        placeholder="e.g., #WIN-1234"
                        placeholderTextColor="#94a3b8"
                        value={reference}
                        onChangeText={setReference}
                    />

                    {/* Message */}
                    <Text className="text-xs font-bold text-slate-900 uppercase mb-3">Description</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-slate-900 h-32 text-top leading-relaxed"
                        placeholder="Tell us exactly what happened..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    {/* Screenshot Mockup (Visual Only) */}
                    <Text className="text-xs font-bold text-slate-900 uppercase mb-3">Attachment</Text>
                    <TouchableOpacity className="border-2 border-dashed border-slate-200 rounded-xl p-6 items-center justify-center mb-8 bg-slate-50">
                        <Ionicons name="camera" size={24} color="#94a3b8" />
                        <Text className="text-slate-400 font-bold mt-2">Add Screenshot</Text>
                    </TouchableOpacity>

                </ScrollView>

                {/* Footer Action */}
                <View className="p-6 border-t border-slate-100 bg-white">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl items-center flex-row justify-center ${isSubmitting ? 'bg-slate-300' : 'bg-red-600'}`}
                    >
                        {isSubmitting ? (
                            <Text className="text-white font-bold">Sending...</Text>
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Submit Report</Text>
                                <FontAwesome5 name="paper-plane" size={16} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
