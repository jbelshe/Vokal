import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { AppStackParamList } from '../types/navigation';

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
  const navigationRef = React.useRef<any>(null);

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
        
        // Handle navigation based on notification data
        // You can customize this based on your notification payload structure
        if (navigationRef.current?.isReady()) {
          const navigation = navigationRef.current;
          
          if (data?.screen) {
            try {
              navigation.navigate(data.screen as keyof AppStackParamList, data.params || {});
            } catch (error) {
              console.error('Navigation error from notification:', error);
            }
          }
          // Example: Navigate to home if no specific screen is provided
          else if (state.isAuthenticated) {
            navigation.navigate('Home');
          }
        }
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
  }, [state.isAuthenticated]);

  if (state.loading) {
    return <Splash />;
  }

  return (
    <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
      {!state.isAuthenticated || state.isOnboarding ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}


