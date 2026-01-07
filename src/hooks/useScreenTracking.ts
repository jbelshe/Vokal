// hooks/useScreenTracking.ts
import { useRef } from 'react';
import { NavigationState } from '@react-navigation/native';
import { usePostHogAnalytics } from './usePostHogAnalytics';
import * as Sentry from '@sentry/react-native';

/**
 * Helper function to get the current route name and params from navigation state
 * Handles nested navigators by recursively traversing the state
 */
function getActiveRoute(
  state: NavigationState | undefined
): { name: string; params?: Record<string, any> } | undefined {
  if (!state) {
    return undefined;
  }

  const route = state.routes[state.index];

  if (route.state) {
    return getActiveRoute(route.state as NavigationState);
  }

  return {
    name: route.name,
    params: route.params as Record<string, any> | undefined,
  };
}

/**
 * Hook to create an onStateChange handler for NavigationContainer
 * that automatically tracks screen views in PostHog and adds Sentry breadcrumbs
 * 
 * Usage in RootNavigator:
 *   const { onStateChange } = useScreenTracking();
 *   <NavigationContainer onStateChange={onStateChange}>
 */
export function useScreenTracking() {
  const { trackScreenViewed } = usePostHogAnalytics();
  const routeNameRef = useRef<string | undefined>(undefined);

  const onStateChange = (state: NavigationState | undefined) => {
    const activeRoute = getActiveRoute(state);
    
    if (!activeRoute) {
      return;
    }

    const previousRouteName = routeNameRef.current;
    const currentRouteName = activeRoute.name;
    const routeParams = activeRoute.params;

    if (previousRouteName !== currentRouteName && currentRouteName) {
      routeNameRef.current = currentRouteName;
      console.log('[PostHog] Screen viewed:', currentRouteName, 'Params:', routeParams);
      
      // Track in PostHog
      trackScreenViewed(currentRouteName, routeParams);
      
      // Add Sentry breadcrumb for navigation
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${currentRouteName}`,
        level: 'info',
        data: {
          from: previousRouteName || 'unknown',
          to: currentRouteName,
          params: routeParams ? JSON.stringify(routeParams) : undefined,
        },
      });
      
      // Set Sentry context for current screen
      Sentry.setContext('screen', {
        name: currentRouteName,
        params: routeParams,
      });
    }
  };

  return { onStateChange };
}

