import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useCallback } from 'react';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { AppStackParamList } from '../types/navigation';
import * as Sentry from '@sentry/react-native';

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
      <ActivityIndicator />
    </View>
  );
}

// Helper function to handle navigation from notification data
const handleNotificationNavigation = (
  data: any,
  navigation: NavigationContainerRef<AppStackParamList> | null,
  isAuthenticated: boolean
): boolean => {
  if (!navigation?.isReady()) {
    console.log('[NOTIFICATION] Navigation not ready yet');
    return false;
  }

  if (!isAuthenticated) {
    console.log('[NOTIFICATION] User not authenticated, skipping navigation');
    return false;
  }

  console.log('[NOTIFICATION] Processing navigation with data:', JSON.stringify(data, null, 2));

  try {
    // Handle different notification payload formats
    
    // Format 1: { screen: "PropertyDetails", params: { propertyId: "123" } }
    if (data?.screen) {
      const screenName = data.screen as keyof AppStackParamList;
      const params = data.params || {};
      
      console.log(`[NOTIFICATION] Navigating to ${screenName} with params:`, params);
      navigation.navigate(screenName, params);
      return true;
    }
    
    // Format 2: { propertyId: "123" } - shortcut to PropertyDetails
    if (data?.propertyId) {
      console.log(`[NOTIFICATION] Navigating to PropertyDetails with propertyId: ${data.propertyId}`);
      navigation.navigate('PropertyDetails', { propertyId: data.propertyId });
      return true;
    }
    
    // Format 3: { id: "123" } - shortcut to Details
    if (data?.id) {
      console.log(`[NOTIFICATION] Navigating to Details with id: ${data.id}`);
      navigation.navigate('Details', { id: data.id });
      return true;
    }
    
    // Default: Navigate to home if no specific screen is provided
    console.log('[NOTIFICATION] No specific screen/data provided, navigating to Home');
    navigation.navigate('Home');
    return true;
    
  } catch (error) {
    console.error('[NOTIFICATION] Navigation error:', error);
    // Capture navigation errors in Sentry
    Sentry.captureException(error, {
      tags: {
        feature: 'notification_navigation',
      },
      extra: {
        notificationData: data,
        isAuthenticated,
      },
    });
    return false;
  }
};

export default function RootNavigator() {
  const { state } = useAuth();
  const { onStateChange } = useScreenTracking();
  const navigationRef = React.useRef<NavigationContainerRef<AppStackParamList> | null>(null);
  const isNavigationReadyRef = useRef(false);
  const processedNotificationIdRef = useRef<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Modern approach: Use the useLastNotificationResponse hook instead of deprecated getLastNotificationResponseAsync
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  // Handle last notification response (covers both initial app launch and background notifications)
  useEffect(() => {
    if (!lastNotificationResponse) {
      return;
    }

    // Skip if we've already processed this notification
    const notificationId = lastNotificationResponse.notification.request.identifier;
    if (processedNotificationIdRef.current === notificationId) {
      return;
    }

    // Only process if it's a user tap (not a programmatic notification)
    if (lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      const data = lastNotificationResponse.notification.request.content.data;
      console.log('[NOTIFICATION] Processing last notification response:', data);

      // Wait for navigation and auth to be ready before processing
      if (!state.loading && state.isAuthenticated && isNavigationReadyRef.current) {
        // Small delay to ensure navigation is fully ready
        const timer = setTimeout(() => {
          const navigated = handleNotificationNavigation(
            data,
            navigationRef.current,
            state.isAuthenticated
          );
          
          if (navigated) {
            processedNotificationIdRef.current = notificationId;
          }
        }, 300);

        return () => clearTimeout(timer);
      } else {
        // Store for later processing when ready
        console.log('[NOTIFICATION] Navigation/auth not ready, will process when ready');
      }
    }
  }, [lastNotificationResponse, state.loading, state.isAuthenticated]);

  // Handler for when navigation container becomes ready
  const handleNavigationReady = useCallback(() => {
    console.log('[NOTIFICATION] Navigation container is ready');
    isNavigationReadyRef.current = true;
    
    // Process any pending notification response once navigation is ready
    if (lastNotificationResponse && state.isAuthenticated && !state.loading) {
      const notificationId = lastNotificationResponse.notification.request.identifier;
      
      // Only process if we haven't already processed this notification
      if (processedNotificationIdRef.current !== notificationId) {
        if (lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          const data = lastNotificationResponse.notification.request.content.data;
          
          // Small delay to ensure everything is ready
          setTimeout(() => {
            const navigated = handleNotificationNavigation(
              data,
              navigationRef.current,
              state.isAuthenticated
            );
            
            if (navigated) {
              processedNotificationIdRef.current = notificationId;
            }
          }, 300);
        }
      }
    }
  }, [lastNotificationResponse, state.isAuthenticated, state.loading]);

  useEffect(() => {
    // Fires when a notification arrives in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('[NOTIFICATION] Notification received in foreground:', notification.request.content.data);
      });

    // Fires when user taps / interacts with notification (app is already running)
    // Note: This listener handles notifications when app is in foreground/background
    // The useLastNotificationResponse hook handles initial notifications from killed state
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('[NOTIFICATION] User interacted with notification (app running):', data);
        
        // Mark this notification as processed
        const notificationId = response.notification.request.identifier;
        processedNotificationIdRef.current = notificationId;
        
        // Try to navigate immediately if ready
        if (navigationRef.current?.isReady() && state.isAuthenticated) {
          handleNotificationNavigation(
            data,
            navigationRef.current,
            state.isAuthenticated
          );
        } else {
          console.log('[NOTIFICATION] Navigation/auth not ready, useLastNotificationResponse will handle it');
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
    <NavigationContainer 
      ref={navigationRef} 
      onStateChange={onStateChange}
      onReady={handleNavigationReady}
    >
      {!state.isAuthenticated || state.isOnboarding ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}


