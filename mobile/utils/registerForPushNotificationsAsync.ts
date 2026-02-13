import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Project ID is handled automatically by Expo in bare/managed workflow usually,
        // but can be explicitly passed if needed. For managed, no arg needed.
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.businessId /* Fallback or remove if standard */
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: projectId // Optional if configured in app.json
            })).data;
            console.log("Expo Push Token:", token);
        } catch (e) {
            console.error("Error getting token", e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
