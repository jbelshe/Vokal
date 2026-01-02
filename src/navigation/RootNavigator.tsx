import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useScreenTracking } from '../hooks/useScreenTracking';

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
      <ActivityIndicator />
    </View>
  );
}


export default function RootNavigator() {
  const { state } = useAuth();
  const { onStateChange } = useScreenTracking();

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Fires when a notification arrives in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        // e.g. update notification badge in state
        console.log('Notification received in foreground:', notification);
      });

    // Fires when user taps / interacts with notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('User interacted with notification:', data);
      });

    // Cleanup on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (state.loading) {
    return <Splash />;
  }

  return (
    <NavigationContainer onStateChange={onStateChange}>
      {!state.isAuthenticated || state.isOnboarding ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}


