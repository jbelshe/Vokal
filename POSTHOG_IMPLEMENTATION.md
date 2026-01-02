# PostHog Implementation Guide

## Current Status
✅ PostHog is installed (`posthog-react-native` v4.14.3)  
✅ PostHogProvider is configured in `RootNavigator.tsx`  
❌ No event tracking is currently implemented  
❌ User identification is not set up  
❌ Screen view tracking is not implemented  

## Recommended Implementation Steps

### 1. Create a Custom Analytics Hook

Create `src/hooks/usePostHogAnalytics.ts` to provide a centralized interface for tracking events.

### 2. Set Up User Identification

Identify users when they authenticate to link events to user profiles. This should be done in `AuthContext.tsx` when a user logs in.

### 3. Track Screen Views

Use React Navigation's navigation state listener to automatically track screen views.

### 4. Track Key User Events

Track important user actions throughout the app:
- **Authentication Events**: Phone number entered, OTP verified, profile created, onboarding completed
- **Voting Events**: Category selected, subcategory selected, vote submitted
- **Navigation Events**: Property viewed, settings accessed, vote history viewed
- **Error Events**: Track errors alongside Sentry

### 5. Best Practices

- Use consistent event naming (e.g., `user_signed_in`, `vote_submitted`)
- Include relevant properties with events (e.g., property_id, category_code)
- Avoid tracking PII (personally identifiable information) unless necessary
- Use feature flags for gradual rollout of tracking

## Event Naming Convention

Recommended format: `[object]_[action]`

Examples:
- `user_signed_in`
- `vote_submitted`
- `property_viewed`
- `screen_viewed`
- `onboarding_completed`

## Priority Events to Track

### High Priority
1. User sign-in/sign-up
2. Vote submission
3. Property views
4. Onboarding completion

### Medium Priority
1. Screen views (automatic)
2. Voting flow progression
3. Profile updates
4. Settings changes

### Low Priority
1. Button clicks (unless critical)
2. Search queries
3. Filter usage

