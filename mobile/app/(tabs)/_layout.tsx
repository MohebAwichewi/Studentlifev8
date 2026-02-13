import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
// FontAwesome is not automatically compatible, we use @expo/vector-icons
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 0,
        elevation: 0,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#0f172a', // slate-900
      tabBarInactiveTintColor: '#94a3b8', // slate-400
      tabBarLabelStyle: { fontWeight: 'bold', fontSize: 10 }
    }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <FontAwesome5 name="wallet" size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="deals" options={{ href: null }} />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color }) => <FontAwesome5 name="fire" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <FontAwesome5 name="map-marked-alt" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="id"
        options={{
          title: 'ID Card',
          tabBarIcon: ({ color }) => <FontAwesome5 name="id-card" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
