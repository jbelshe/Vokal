// notifications.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    console.log("[NOTIFICATIONS] Checking device and permissions...");
    // if (!Device.isDevice) {
    //     console.warn("[NOTIFICATIONS] Notifications only work on a physical device");
    //     return null;
    // }

    // 1) Check existing permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("[NOTIFICATIONS] Existing permission status:", existingStatus);
    let finalStatus = existingStatus;


    if (!Device.isDevice) {
        console.warn("[NOTIFICATIONS] Notifications only work on a physical device");
        return null;
    }

    // 2) If undetermined (or not granted yet), ask once
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // 3) Still not granted → bail
    if (finalStatus !== 'granted') {
        console.log("[NOTIFICATIONS] Permission not granted, returning null");
        return null;
    }

    console.log("[NOTIFICATIONS] Setting up notification channel...");
    // 4) Android 13+ needs a channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        });
    }
    console.log("[NOTIFICATIONS] Getting Expo push token...");
    // 5) Get Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;

    console.log('[NOTIFICATIONS] Expo push token:', token);
    return token;
}
