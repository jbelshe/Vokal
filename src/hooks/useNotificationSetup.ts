// useNotificationsSetup.ts
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { supabase } from '../lib/supabase'; 
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types/profile';

export function useNotificationsSetup(session: Session | null, profile: Profile) {
  useEffect(() => {
    if (!session) return; // only once user is logged in
    console.log("Setting up notifications for user:", session.user.id);

    (async () => {
      const token = await registerForPushNotificationsAsync();
      console.log("Push notification token:", token);
      console.log("Current profile expoPushToken:", profile);
      if (!token) return;

      // Avoid useless writes if unchanged
      if (profile?.expoPushToken === token) return;

      // Update your profiles table (name/shape may differ in your app)
      const { error } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', session.user.id);

      if (error) {
        console.warn('Failed to update push token:', error.message);
      }
    })();
  }, [session?.user?.id]);
}
