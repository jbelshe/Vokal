// hooks/usePostHogAnalytics.ts
import { usePostHog } from 'posthog-react-native';
import { useMemo } from 'react';

/**
 * Custom hook for PostHog analytics tracking
 * Provides type-safe event tracking with consistent naming conventions
 */
export function usePostHogAnalytics() {
  const posthog = usePostHog();
  
  // Debug: Check if PostHog is available
  if (__DEV__ && !posthog) {
    console.warn('[PostHog] usePostHog returned null - make sure PostHogProvider wraps your component');
  }

  return useMemo(() => {
    // Authentication Events
    // Note: User should be identified separately using identifyUser() before calling this
    const trackSignIn = (userId: string, method: 'phone' = 'phone') => {
        console.log('[PostHog] trackSignIn', userId, method);
        posthog?.capture('user_signed_in', {
            method,
            timestamp: new Date().toISOString(),
        });
    };

    const trackSignOut = () => {
        console.log('[PostHog] trackSignOut');
        posthog?.capture('user_signed_out');
        posthog?.reset();
    };

    const trackOTPRequested = (phoneNumber: string) => {
        console.log('[PostHog] trackOTPRequested', phoneNumber);
        posthog?.capture('otp_requested', {
            // Don't log full phone number for privacy, just country code if needed
            phone_country_code: phoneNumber.substring(0, 3),
        });
    };

    const trackOTPRerequested = (phoneNumber: string) => {
        console.log('[PostHog] trackOTPRerequested', phoneNumber);
        posthog?.capture('otp_re_requested', {
          // Don't log full phone number for privacy, just country code if needed
          phone_country_code: phoneNumber.substring(0, 3),
        });
      };

    const trackOTPVerified = () => {
        posthog?.capture('otp_verified');
    };

    const trackOTPFailed = () => {
        console.log('[PostHog] trackOTPFailed');
        posthog?.capture('otp_verification_failed');
    };

    const trackProfileCreated = (userId: string) => {
      console.log('[PostHog] trackProfileCreated', userId);
      posthog?.identify(userId);
      posthog?.capture('profile_created', {user_id: userId});
    };

    const trackOnboardingCompleted = (userId: string) => {
      console.log('[PostHog] trackOnboardingCompleted', userId);
      posthog?.identify(userId);
      posthog?.capture('onboarding_completed');
    };

    // Voting Events
    const trackVoteSubmitted = (voteData: {
      propertyId: string;
      categoryCode: string;
      subcategoryCode: string;
      hasNote: boolean;
    }) => {
      console.log('[PostHog] trackVoteSubmitted', voteData);
      posthog?.capture('vote_submitted', {
        property_id: voteData.propertyId,
        category_code: voteData.categoryCode,
        subcategory_code: voteData.subcategoryCode,
        has_note: voteData.hasNote,
      });
    };

    const trackCategorySelected = (category: string) => {
      posthog?.capture('category_selected', {
        category_code: category,
      });
    };

    const trackSubcategorySelected = (subcategoryCode: string, categoryCode: string) => {
      posthog?.capture('subcategory_selected', {
        subcategory_code: subcategoryCode,
        category_code: categoryCode,
      });
    };

    const trackVotingFlowStarted = (propertyId: string) => {
      posthog?.capture('voting_flow_started', {
        property_id: propertyId,
      });
    };

    const trackVotingFlowCompleted = (propertyId: string) => {
      posthog?.capture('voting_flow_completed', {
        property_id: propertyId,
      });
    };

    const trackVotingFlowAbandoned = (propertyId: string, step: string) => {
      posthog?.capture('voting_flow_abandoned', {
        property_id: propertyId,
        abandoned_at_step: step,
      });
    };

    // Navigation Events
    const trackPropertyViewed = (propertyId: string, source?: string) => {
      posthog?.capture('property_viewed', {
        property_id: propertyId,
        source: source || 'unknown',
      });
    };

    const trackScreenViewed = (screenName: string, properties?: Record<string, any>) => {
      console.log('[PostHog] trackScreenViewed', screenName, posthog ? 'PostHog available' : 'PostHog null', "Properties:", properties);
      posthog?.capture('screen_viewed', {
        screen_name: screenName,
        ...properties,
      });
    };

    // User Action Events
    const trackProfileUpdated = (fields: string[]) => {
      console.log('[PostHog] trackProfileUpdated', fields);
      posthog?.capture('profile_updated', {
        updated_fields: fields,
      });
    };

    const trackSettingsChanged = (settingName: string, value: any) => {
      console.log('[PostHog] trackSettingsChanged', settingName, value);
      posthog?.capture('settings_changed', {
        setting_name: settingName,
        setting_value: value,
      });
    };

    // Generic event tracker for flexibility
    const trackEvent = (eventName: string, properties?: Record<string, any>) => {
      console.log('[PostHog] trackEvent', eventName, properties);
      posthog?.capture(eventName, properties);
    };

    // Identify user with additional properties
    const identifyUser = (userId: string, userProperties?: {
      email?: string;
      firstName?: string;
      zipCode?: string;
      [key: string]: any;
    }) => {
      console.log('[PostHog] identifyUser', userId, userProperties, posthog ? 'PostHog available' : 'PostHog null');
      posthog?.identify(userId, userProperties);
    };

    // Set user properties (requires user to be identified first with userId)
    // Note: In PostHog, you typically set user properties when calling identify()
    // This method allows updating properties, but requires the userId
    // If you don't have the userId, use identifyUser() instead
    const setUserProperties = (userId: string, properties: Record<string, any>) => {
      // Re-identify with new properties (PostHog merges properties)
      posthog?.identify(userId, properties);
    };

    return {
      // Authentication
      trackSignIn,
      trackSignOut,
      trackOTPRequested,
      trackOTPRerequested,
      trackOTPVerified,
      trackOTPFailed,
      trackProfileCreated,
      trackOnboardingCompleted,
      
      // Voting
      trackVoteSubmitted,
      trackCategorySelected,
      trackSubcategorySelected,
      trackVotingFlowStarted,
      trackVotingFlowCompleted,
      trackVotingFlowAbandoned,
      
      // Navigation
      trackPropertyViewed,
      trackScreenViewed,
      
      // User Actions
      trackProfileUpdated,
      trackSettingsChanged,
      
      // Generic
      trackEvent,
      identifyUser,
      setUserProperties,
    };
  }, [posthog]);
}

