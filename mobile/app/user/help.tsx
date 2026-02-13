import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpScreen() {
    const router = useRouter();
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const FAQS = [
        {
            id: '1',
            question: 'How do I redeem a deal?',
            answer: 'To redeem a deal, simply visit the shop, open the deal in the app, and tap "Redeem Now". Show the countdown timer to the cashier.'
        },
        {
            id: '2',
            question: 'Can I use a deal more than once?',
            answer: 'Some deals are "Single Use" and disappear after redemption. Others reload after a cooldown period (e.g., 24 hours).'
        },
        {
            id: '3',
            question: 'My code was refused. What do I do?',
            answer: 'We are sorry to hear that! Please use the "Report a Problem" button below so we can investigate immediately.'
        },
        {
            id: '4',
            question: 'How do I earn points?',
            answer: 'You earn points by redeeming deals, completing orders, and inviting friends. Check the "Rewards" tab for more info.'
        }
    ];

    const TUTORIALS = [
        { id: '1', title: 'How to Scan', duration: '0:45', color: '#3b82f6' },
        { id: '2', title: 'Finding Deals', duration: '1:20', color: '#10b981' },
        { id: '3', title: 'Using Wallet', duration: '0:30', color: '#f59e0b' },
    ];

    const toggleFaq = (id: string) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleCall = () => {
        Linking.openURL('tel:+21671123456');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@winapp.tn');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-slate-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
                    <FontAwesome5 name="arrow-left" size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Help & Support</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>

                {/* --- HEADER --- */}
                <View className="p-6 bg-slate-50">
                    <Text className="text-2xl font-black text-slate-900 mb-2">How can we help you?</Text>
                    <Text className="text-slate-500 leading-relaxed">
                        Search our knowledge base or contact our support team directly.
                    </Text>
                </View>

                {/* --- CONTACT OPTIONS --- */}
                <View className="px-6 py-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-4 ml-1">Quick Actions</Text>
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => router.push('/user/report')}
                            className="flex-1 bg-red-50 border border-red-100 p-4 rounded-2xl items-center"
                        >
                            <MaterialIcons name="report-problem" size={24} color="#dc2626" />
                            <Text className="font-bold text-red-600 mt-2">Report Issue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCall}
                            className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl items-center"
                        >
                            <Ionicons name="call" size={24} color="#0f172a" />
                            <Text className="font-bold text-slate-900 mt-2">Call Us</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleEmail}
                            className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl items-center"
                        >
                            <Ionicons name="mail" size={24} color="#0f172a" />
                            <Text className="font-bold text-slate-900 mt-2">Email Us</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- TUTORIALS --- */}
                <View className="mb-8">
                    <Text className="px-6 text-xs font-bold text-slate-400 uppercase mb-4 ml-1">Video Tutorials</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
                        {TUTORIALS.map((video) => (
                            <TouchableOpacity key={video.id} className="w-40 h-28 rounded-xl overflow-hidden relative shadow-sm">
                                <View style={{ backgroundColor: video.color, flex: 1 }} className="items-center justify-center">
                                    <FontAwesome5 name="play-circle" size={32} color="white" />
                                </View>
                                <View className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                    <Text className="text-white font-bold text-xs">{video.title}</Text>
                                    <Text className="text-white/80 text-[10px]">{video.duration}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* --- FAQs --- */}
                <View className="px-6">
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-4 ml-1">Frequently Asked Questions</Text>
                    <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                        {FAQS.map((faq, index) => (
                            <View key={faq.id} className={`border-b border-slate-50 ${index === FAQS.length - 1 ? 'border-b-0' : ''}`}>
                                <TouchableOpacity
                                    onPress={() => toggleFaq(faq.id)}
                                    className="p-4 flex-row justify-between items-center bg-white active:bg-slate-50"
                                >
                                    <Text className="font-bold text-slate-900 flex-1 mr-4">{faq.question}</Text>
                                    <FontAwesome5 name={expandedFaq === faq.id ? "minus" : "plus"} size={12} color="#cbd5e1" />
                                </TouchableOpacity>
                                {expandedFaq === faq.id && (
                                    <View className="px-4 pb-4 bg-slate-50/50">
                                        <Text className="text-slate-600 leading-relaxed text-sm">{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <View className="items-center mt-10 mb-6">
                    <Text className="text-slate-400 text-xs text-center px-10">
                        Still need help? Our support team is available Mon-Fri, 9am - 6pm.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
