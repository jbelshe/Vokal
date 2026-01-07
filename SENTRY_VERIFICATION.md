# Sentry Verification & Testing Guide

## Quick Verification Checklist

### ✅ What's Already Set Up (Automatic)

1. **Global Error Boundary** - `Sentry.wrap()` in `App.tsx` catches all unhandled React errors
2. **Navigation Tracking** - Automatic breadcrumbs and screen context via `useScreenTracking`
3. **User Context** - Automatically set in `AuthContext` when user logs in
4. **Native Crashes** - Automatically captured if native code crashes
5. **Session Tracking** - Automatic session tracking enabled

### 🔍 How to Verify Sentry is Working

#### Method 1: Use the Test Utility (Recommended)

Add this to any screen temporarily (e.g., `HomeScreen.tsx`):

```typescript
import { testSentrySetup } from '../lib/sentryTestUtils';
import { useEffect } from 'react';

// In your component:
useEffect(() => {
  // Run test on mount (remove after verification)
  const result = testSentrySetup();
  console.log('Sentry Test Results:', result);
}, []);
```

Then:
1. Run your app
2. Check the console for test results
3. Go to your Sentry dashboard (https://sentry.io)
4. Look for events with tag `test: true` - you should see:
   - A test exception
   - A test message
   - Breadcrumbs

#### Method 2: Manual Test

Add a test button to a screen:

```typescript
import { captureException, captureMessage } from '../lib/sentryHelpers';

// In your component:
const testSentry = () => {
  // Test exception
  captureException(new Error('Manual Sentry Test'), {
    feature: 'manual_test',
  });
  
  // Test message
  captureMessage('Manual Sentry test message', {
    feature: 'manual_test',
    level: 'info',
  });
  
  alert('Test events sent! Check Sentry dashboard.');
};
```

#### Method 3: Check Sentry Dashboard

1. Go to https://sentry.io
2. Navigate to your project
3. Check "Issues" - you should see errors if any occurred
4. Check "Performance" - you should see navigation events
5. Check "Releases" - verify your app version is listed

### 📊 What to Look For in Sentry Dashboard

1. **Issues Tab**
   - Should show any errors that occurred
   - Each error should have:
     - Stack trace
     - User context (if logged in)
     - Screen context
     - Breadcrumbs showing navigation path

2. **Performance Tab**
   - Should show navigation events
   - API call durations (if using `trackAPICall`)

3. **Releases Tab**
   - Should show your app version
   - Associates errors with specific versions

4. **Users Tab**
   - Should show user IDs when users are logged in

## Do You Need to Add Sentry to Every Screen?

### ❌ NO - You Don't Need to Add Sentry to Every Screen

**What's Already Automatic:**
- ✅ All unhandled errors are caught by `Sentry.wrap()` in `App.tsx`
- ✅ Navigation is automatically tracked via `useScreenTracking`
- ✅ Screen context is automatically set on navigation
- ✅ Native crashes are automatically captured

### ✅ When You SHOULD Add Sentry Manually

#### 1. **Critical Error Handling in Try/Catch Blocks**

When you catch errors that you want to track:

```typescript
import { captureException } from '../lib/sentryHelpers';

try {
  await someCriticalOperation();
} catch (error) {
  // Show user-friendly error
  setError('Something went wrong');
  
  // Track in Sentry with context
  captureException(error as Error, {
    feature: 'critical_operation',
    tags: { screen: 'HomeScreen' },
    extra: { userId: user.id },
  });
}
```

#### 2. **API Calls That Might Fail**

Wrap important API calls:

```typescript
import { trackAPICall } from '../lib/sentryHelpers';

// Option 1: Use trackAPICall wrapper
const properties = await trackAPICall('fetchProperties', () =>
  fetchPropertiesInBounds(bounds)
);

// Option 2: Manual tracking in catch block
try {
  const data = await fetchPropertiesInBounds(bounds);
  return data;
} catch (error) {
  captureException(error as Error, {
    feature: 'api',
    tags: { apiName: 'fetchProperties' },
  });
  throw error;
}
```

#### 3. **User Actions You Want to Track**

Track important user actions as breadcrumbs:

```typescript
import { addBreadcrumb } from '../lib/sentryHelpers';

const handleVote = async () => {
  addBreadcrumb('User submitted vote', {
    propertyId: property.id,
    category: selectedCategory,
  }, 'user_action');
  
  try {
    await submitVote();
  } catch (error) {
    // Error will be caught and tracked
  }
};
```

#### 4. **Screen-Specific Context**

If a screen has important context, set it explicitly:

```typescript
import { setScreenContext } from '../lib/sentryHelpers';
import { useEffect } from 'react';

useEffect(() => {
  setScreenContext('PropertyDetails', { propertyId: route.params.propertyId });
}, [route.params.propertyId]);
```

**Note:** This is optional since `useScreenTracking` already sets screen context automatically.

## Recommended Implementation Pattern

### For API Calls

**Current Pattern (Good):**
```typescript
// In your API files (src/api/*.ts)
export async function fetchProperties() {
  try {
    const { data, error } = await supabase.from('properties').select();
    if (error) throw error;
    return data;
  } catch (error) {
    // Errors bubble up - caught by caller or global handler
    throw error;
  }
}
```

**Enhanced Pattern (Better):**
```typescript
import { trackAPICall } from '../lib/sentryHelpers';

export async function fetchProperties() {
  return trackAPICall('fetchProperties', async () => {
    const { data, error } = await supabase.from('properties').select();
    if (error) throw error;
    return data;
  });
}
```

### For Screen Error Handling

**Pattern:**
```typescript
import { captureException } from '../lib/sentryHelpers';

const handleAction = async () => {
  try {
    await performAction();
  } catch (error) {
    // User-friendly error
    Alert.alert('Error', 'Failed to perform action');
    
    // Track in Sentry
    captureException(error as Error, {
      feature: 'screen_action',
      tags: { screen: 'HomeScreen', action: 'performAction' },
    });
  }
};
```

## What's Missing? (Optional Enhancements)

### 1. **Error Boundary for Critical Screens** (Optional)

Wrap critical screens with error boundary:

```typescript
import { SentryErrorBoundary } from '../components/SentryErrorBoundary';

<SentryErrorBoundary>
  <CriticalScreen />
</SentryErrorBoundary>
```

### 2. **API Call Tracking** (Recommended)

Enhance your API functions to use `trackAPICall`:

```typescript
// In src/api/properties.ts, src/api/auth.ts, etc.
import { trackAPICall } from '../lib/sentryHelpers';
```

### 3. **User Action Breadcrumbs** (Optional)

Add breadcrumbs for important user actions:

```typescript
import { addBreadcrumb } from '../lib/sentryHelpers';

// When user votes, searches, etc.
addBreadcrumb('User performed action', { action: 'vote' });
```

## Testing Checklist

- [ ] Run `testSentrySetup()` and verify events appear in Sentry
- [ ] Trigger a test error and verify it appears in Sentry dashboard
- [ ] Navigate between screens and verify breadcrumbs appear
- [ ] Log in and verify user context is set
- [ ] Check Sentry dashboard for:
  - [ ] Issues appear with stack traces
  - [ ] User context is attached
  - [ ] Screen context is attached
  - [ ] Breadcrumbs show navigation path
  - [ ] Release version is correct

## Common Issues

### Events Not Appearing in Sentry

1. **Check DSN** - Verify DSN is correct in `App.tsx`
2. **Check Network** - Ensure device has internet connection
3. **Check Environment** - Verify you're looking at the right environment in Sentry
4. **Check Debug Mode** - Enable `debug: true` in dev to see Sentry logs
5. **Check Filters** - Verify `beforeSend` isn't filtering out your events

### Missing Context

1. **User Context** - Ensure user is logged in (set in `AuthContext`)
2. **Screen Context** - Verify `useScreenTracking` is being used
3. **Breadcrumbs** - Check that navigation is triggering breadcrumbs

## Next Steps

1. ✅ Run the test utility to verify setup
2. ✅ Check your Sentry dashboard
3. ⚠️ Add `trackAPICall` to critical API functions (optional but recommended)
4. ⚠️ Add error handling with `captureException` in critical try/catch blocks (optional)
5. ✅ Monitor Sentry dashboard for real errors

Your Sentry setup is already comprehensive! Most errors will be caught automatically. Only add manual tracking for critical operations or when you need additional context.

