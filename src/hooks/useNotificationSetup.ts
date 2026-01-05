// useNotificationsSetup.ts
import { useEffect } from 'react';
import { registerForPushNotificationsAsync, savePushToken } from '../lib/notifications';
import { supabase } from '../lib/supabase'; 
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types/profile';

export function useNotificationsSetup(session: Session | null, profile: Profile) {
  useEffect(() => {
    if (!session || !profile?.userId) return; // only once user is logged in
    console.log("Setting up notifications for user:", session.user.id);

    (async () => {
      const token = await registerForPushNotificationsAsync();
      console.log("Push notification token:", token);
      console.log("Current profile expoPushToken:", profile?.expoPushToken);
      
      // If user has notifications enabled but no token, or token has changed, update it
      // Also update if token is null but we got a new one (permission was granted)
      if (profile?.notificationsEnabled && token && profile?.expoPushToken !== token) {
        try {
          await savePushToken(profile.userId!, token);
          console.log("Updated push token for user");
        }
        catch (error) {
          console.warn('Failed to update push token:', error);
        }
      }
      // If we have a token but notifications are disabled, don't save it
      // (token will be cleared when user disables notifications)
    })();
  }, [session?.user?.id, profile?.userId, profile?.notificationsEnabled, profile?.expoPushToken]);
}
