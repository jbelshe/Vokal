// notifications.ts
import { updateProfile } from '@/api/auth';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { Profile } from '@/types/profile';

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



export async function savePushToken(userId: string, token: string | null) {
    const profile_update: Partial<Profile> = {
        userId: userId,
        expoPushToken: token
    }

    const result = await updateProfile(profile_update);
    console.log(`Saving push token for user ${userId}: ${token}`);


    if (!result) {
        console.error("Failed to save push token");
    }
}



export async function ensureNotificationsRegistered(userId: string): Promise<string | undefined> {
    const { status } = await Notifications.getPermissionsAsync();
    console.log("Current notification status:", status);
    if (status !== "granted") {
        console.log("Notifications still not granted");
        return;
    }
    console.log("Notifications are granted, proceeding to get token");

    try {
        // Get Expo push token
        let tokenData: { data: string | undefined };
        if (!Device.isDevice) {
            console.warn("[NOTIFICATIONS] Notifications only work on a physical device - using fake data");
            tokenData = { data: undefined};
        }
        else {
            tokenData = await Notifications.getExpoPushTokenAsync();
        }
        
        const expoPushToken = tokenData.data;
        console.log("Got Expo push token:", expoPushToken);
        // Save token to Supabase (example schema)
        await savePushToken(userId, expoPushToken ?? null);
        return expoPushToken ?? undefined;
    } catch (error) {
        console.error("Failed to get Expo push token:", error);
        return;
    }

}