import React from 'react';
<<<<<<< HEAD
import { View, Text, Image, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
=======
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import TiltCard from '../../components/TiltCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function IDScreen() {
    const { user } = useAuth();
    const screenWidth = Dimensions.get('window').width;

<<<<<<< HEAD
    // Use placeholder data if user isn't fully loaded to prevent crash during dev preview
    const userData = user || {
        fullName: 'User Name',
        university: 'University Member',
        id: '2024-USER-ID',
    };
=======
    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-[#0f172a] justify-center items-center">
                <View className="items-center">
                    <Text className="text-white font-bold">Loading ID...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const userData = user;
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a] justify-center items-center">

            <View className="items-center mb-10">
                <Text className="text-white text-3xl font-black tracking-tight">Digital ID</Text>
                <Text className="text-slate-400 font-medium text-base mt-2">Show this to redeem in-store</Text>
            </View>

            {/* Card Container */}
            <TiltCard>
                <View style={styles.cardInner}>

                    {/* Header */}
                    <View className="bg-[#2563eb] h-24 flex-row justify-between items-start px-6 pt-6">
<<<<<<< HEAD
                        <Text className="text-white font-black text-2xl tracking-tight">WIN</Text>
                        <View className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
                            <Text className="text-white text-[10px] font-black tracking-widest uppercase">VERIFIED</Text>
=======
                        <Text className="text-white font-black text-2xl tracking-tight">Student.LIFE</Text>
                        <View className={`px-3 py-1.5 rounded-lg backdrop-blur-md ${userData.isVerified ? 'bg-white/20' : 'bg-red-500/80'}`}>
                            <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                                {userData.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </Text>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        </View>
                    </View>

                    {/* Profile Picture Override - Negative Margin to pull it up */}
                    <View className="items-center -mt-12">
                        <View className="w-28 h-28 rounded-full border-[6px] border-white shadow-sm bg-slate-200 justify-center items-center overflow-hidden">
<<<<<<< HEAD
                            {/* Placeholder for User Avatar */}
                            <Image
                                source={require('../../assets/images/icon.png')}
                                className="w-20 h-20"
                                resizeMode="contain"
=======
                            <Image
                                source={userData.profilePicture ? { uri: userData.profilePicture } : require('../../assets/logo.png')}
                                className="w-full h-full"
                                resizeMode="cover"
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                            />
                        </View>
                    </View>

                    {/* Content */}
                    <View className="flex-1 items-center pt-4 pb-8 px-8">

                        <Text className="text-2xl font-black text-slate-900 text-center mb-1">
                            {userData.fullName}
                        </Text>
                        <Text className="text-slate-500 font-bold text-sm text-center uppercase tracking-wide mb-8">
                            {userData.university}
                        </Text>

                        {/* QR Code */}
                        <View className="p-1">
                            <QRCode
                                value={userData.id}
                                size={180}
                                color="#0f172a"
                                backgroundColor="white"
                            />
                        </View>

                        <Text className="text-[10px] text-slate-300 font-mono mt-4 text-center">
                            ID: {userData.id}
                        </Text>
                    </View>

                    {/* Footer Expiry */}
                    <View className="bg-slate-50 py-4 items-center border-t border-slate-100">
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
<<<<<<< HEAD
                            Expires: 31 SEP 2026
=======
                            Expires: 30 SEP {new Date().getMonth() > 8 ? new Date().getFullYear() + 1 : new Date().getFullYear()}
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        </Text>
                    </View>
                </View>
            </TiltCard>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cardInner: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
    }
});
<<<<<<< HEAD

=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
