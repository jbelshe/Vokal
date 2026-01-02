# PostHog Quick Start Guide

## Overview

This guide provides a simple, step-by-step approach to implementing PostHog analytics in your Vokal app.

## What's Already Done ✅

- PostHog SDK installed (`posthog-react-native` v4.14.3)
- PostHogProvider configured in `RootNavigator.tsx`
- Custom analytics hook created (`src/hooks/usePostHogAnalytics.ts`)
- Screen tracking hook created (`src/hooks/useScreenTracking.ts`)

## Quick Implementation (3 Steps)

### Step 1: Enable Screen Tracking (5 minutes)

Update `src/navigation/RootNavigator.tsx`:

```typescript
import { useScreenTracking } from '../hooks/useScreenTracking';

export default function RootNavigator() {
  const { state } = useAuth();
  const { onStateChange } = useScreenTracking();

  // ... existing code ...

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <PostHogProvider
        // ... existing props ...
      >
        {/* ... existing content ... */}
      </PostHogProvider>
    </NavigationContainer>
  );
}
```

### Step 2: Identify Users on Login (10 minutes)

Update `src/context/AuthContext.tsx`:

1. Import the hook at the top:
```typescript
import { usePostHogAnalytics } from '../hooks/usePostHogAnalytics';
```

2. Add inside `AuthProvider`:
```typescript
const analytics = usePostHogAnalytics();
```

3. In `handleSessionChange`, after profile is loaded:
```typescript
if (userProfile && userProfile.firstName) {
  analytics.identifyUser(userProfile.userId, {
    email: userProfile.email || undefined,
    firstName: userProfile.firstName,
    zipCode: userProfile.zipCode || undefined,
  });
  analytics.trackSignIn(userProfile.userId);
  // ... existing code ...
}
```

4. In `signOut` function:
```typescript
analytics.trackSignOut();
```

### Step 3: Track Vote Submissions (10 minutes)

Update `src/screens/voting-flow/AdditionalNoteScreen.tsx`:

1. Import the hook:
```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';
```

2. Add inside component:
```typescript
const analytics = usePostHogAnalytics();
const { categorySelected, additionalNote } = useVotingContext();
```

3. In `handleSendVote`, after successful vote:
```typescript
if (success && currentPropertyId) {
  analytics.trackVoteSubmitted({
    propertyId: currentPropertyId,
    categoryCode: categorySelected!,
    subcategoryCode: subCategorySelected,
    hasNote: !!additionalNote && additionalNote.trim().length > 0,
  });
}
```

## Verify It's Working

1. **Build and run your app**
2. **Log in to your app**
3. **Navigate through screens**
4. **Submit a vote**
5. **Check PostHog Dashboard**:
   - Go to https://us.i.posthog.com
   - Navigate to "Live Events" or "Events"
   - You should see events like:
     - `screen_viewed`
     - `user_signed_in`
     - `vote_submitted`

## Next Steps (Optional)

Once the basics are working, you can add more tracking:

1. **Authentication events** - OTP requests, profile creation (see `POSTHOG_INTEGRATION_EXAMPLES.md`)
2. **Voting flow tracking** - Track each step of the voting process
3. **Property views** - Track which properties users view
4. **Settings changes** - Track user preference changes

See `POSTHOG_INTEGRATION_EXAMPLES.md` for detailed examples of all available tracking methods.

## Available Tracking Methods

The `usePostHogAnalytics()` hook provides these methods:

### Authentication
- `trackSignIn(userId, method?)`
- `trackSignOut()`
- `trackOTPRequested(phoneNumber)`
- `trackOTPVerified()`
- `trackProfileCreated(userId, profileData)`
- `trackOnboardingCompleted(userId, screenNumber)`

### Voting
- `trackVoteSubmitted(voteData)`
- `trackCategorySelected(categoryCode)`
- `trackSubcategorySelected(subcategoryCode, categoryCode)`
- `trackVotingFlowStarted(propertyId)`
- `trackVotingFlowCompleted(propertyId)`
- `trackVotingFlowAbandoned(propertyId, step)`

### Navigation
- `trackPropertyViewed(propertyId, source?)`
- `trackScreenViewed(screenName, properties?)` (automated via hook)

### User Actions
- `trackProfileUpdated(fields)`
- `trackSettingsChanged(settingName, value)`

### Utility
- `trackEvent(eventName, properties?)` - Generic event tracker
- `identifyUser(userId, userProperties?)` - Identify user
- `setUserProperties(userId, properties)` - Update user properties

## Troubleshooting

**Events not appearing in PostHog?**
- Check that PostHogProvider is wrapping your navigation
- Verify the API key is correct
- Check network requests in your debugger
- Ensure you're calling tracking methods after user interaction

**User identification not working?**
- Make sure you call `identifyUser()` after the user logs in
- Verify the userId is being passed correctly

**Too many events?**
- Screen tracking is automatic - this is normal
- Consider filtering events in PostHog dashboard
- You can disable screen tracking by not using `useScreenTracking`

## Documentation

- **Full Implementation Guide**: `POSTHOG_IMPLEMENTATION.md`
- **Code Examples**: `POSTHOG_INTEGRATION_EXAMPLES.md`
- **PostHog Docs**: https://posthog.com/docs

