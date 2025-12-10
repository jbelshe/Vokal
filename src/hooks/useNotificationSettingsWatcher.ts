import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Linking } from "react-native";
import { ensureNotificationsRegistered } from "../lib/notifications";

export function useNotificationSettingsWatcher(userId: string) {
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const awaitingNotifSettingsRef = useRef(false);

    // Call this when the user taps "Open Settings"
    const openNotificationSettings = useCallback(() => {
        console.log("Opening notification settings");
        awaitingNotifSettingsRef.current = true;
        Linking.openSettings();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", async nextState => {
            const prevState = appState.current;

            // App was in background/inactive, now active again
            if (
                (prevState === "background" || prevState === "inactive") &&
                nextState === "active"
            ) {
                if (awaitingNotifSettingsRef.current) {
                    console.log("Coming back from notification settings");
                    // We just came back from Settings after asking about notifications
                    awaitingNotifSettingsRef.current = false;
                    await ensureNotificationsRegistered(userId);
                }
            }

            appState.current = nextState;
        });

        return () => subscription.remove();
    }, [userId]);



    return {
        openNotificationSettings
    };
}
