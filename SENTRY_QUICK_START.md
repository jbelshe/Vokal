# Sentry Quick Start - Verification & Usage

## ✅ Is Sentry Working? Quick Test

### Option 1: Add Test Button (Easiest)

Add this to any screen (e.g., `HomeScreen.tsx`):

```typescript
import { testSentrySetup } from '../lib/sentryTestUtils';
import { Button } from 'react-native';

// In your component:
<Button 
  title="Test Sentry" 
  onPress={() => {
    const result = testSentrySetup();
    console.log('Sentry Status:', result);
    alert(`Sentry Test Complete!\nCheck dashboard for events.`);
  }} 
/>
```

Then:
1. Tap the button
2. Go to https://sentry.io → Your Project → Issues
3. Look for events tagged with `test: true`

### Option 2: Check Console Logs

In development, Sentry logs to console. Look for:
- `[Sentry]` prefixed messages
- No errors about DSN or initialization

### Option 3: Trigger a Real Error

Add this temporarily to test:

```typescript
import { captureException } from '../lib/sentryHelpers';

// Trigger a test error
const testError = () => {
  try {
    throw new Error('Test error for Sentry');
  } catch (error) {
    captureException(error as Error, {
      feature: 'test',
      tags: { test: 'true' },
    });
  }
};
```

## 📋 What's Already Working (Automatic)

You DON'T need to add anything to screens for these:

✅ **All unhandled errors** - Caught by `Sentry.wrap()` in `App.tsx`  
✅ **Navigation tracking** - Automatic via `useScreenTracking`  
✅ **Screen context** - Automatically set on navigation  
✅ **User context** - Automatically set in `AuthContext`  
✅ **Native crashes** - Automatically captured  
✅ **Session tracking** - Enabled automatically  

## 🎯 When to Add Sentry Manually

### 1. **Critical Try/Catch Blocks** (Recommended)

When you catch errors that matter:

```typescript
import { captureException } from '../lib/sentryHelpers';

try {
  await criticalOperation();
} catch (error) {
  // Show user error
  setError('Operation failed');
  
  // Track in Sentry
  captureException(error as Error, {
    feature: 'critical_operation',
    tags: { screen: 'HomeScreen' },
  });
}
```

### 2. **API Calls** (Optional but Recommended)

Wrap important API calls:

```typescript
import { trackAPICall } from '../lib/sentryHelpers';

// Before:
const data = await fetchPropertiesInBounds(bounds);

// After:
const data = await trackAPICall('fetchProperties', () =>
  fetchPropertiesInBounds(bounds)
);
```

### 3. **User Actions** (Optional)

Track important actions:

```typescript
import { addBreadcrumb } from '../lib/sentryHelpers';

const handleVote = () => {
  addBreadcrumb('User submitted vote', { propertyId }, 'user_action');
  // ... rest of code
};
```

## 🔍 Verification Checklist

Run through this to verify everything:

- [ ] **Test Utility Works**
  - Add test button, tap it
  - Check Sentry dashboard for test events

- [ ] **Navigation Tracking**
  - Navigate between screens
  - Check Sentry → Issues → Click any error → See breadcrumbs

- [ ] **User Context**
  - Log in to app
  - Trigger an error
  - Check Sentry → Issues → See user ID attached

- [ ] **Error Capture**
  - Trigger a test error
  - Check Sentry dashboard within 1-2 minutes
  - Error should appear with stack trace

- [ ] **Release Tracking**
  - Check Sentry → Releases
  - Should see your app version

## 📊 What to Check in Sentry Dashboard

1. **Issues Tab** - Should show errors with:
   - ✅ Stack traces
   - ✅ User context (if logged in)
   - ✅ Screen context
   - ✅ Breadcrumbs (navigation path)

2. **Performance Tab** - Should show:
   - ✅ Navigation events
   - ✅ API call durations (if using `trackAPICall`)

3. **Releases Tab** - Should show:
   - ✅ Your app version
   - ✅ Errors associated with versions

## 🚨 Common Issues

### "Events not appearing in Sentry"

1. Check DSN in `App.tsx` is correct
2. Check device has internet
3. Check you're looking at right environment in Sentry
4. Enable `debug: true` in dev to see Sentry logs
5. Wait 1-2 minutes (events are batched)

### "Missing context in errors"

1. **User context** - Make sure user is logged in
2. **Screen context** - Verify `useScreenTracking` is used (it is!)
3. **Breadcrumbs** - Should appear automatically on navigation

## 💡 Quick Examples

### Example 1: Add Error Tracking to API Call

```typescript
// src/api/properties.ts
import { trackAPICall } from '../lib/sentryHelpers';

export async function fetchPropertiesInBounds(bounds, profileId) {
  return trackAPICall('fetchPropertiesInBounds', async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      // ... rest of query
    
    if (error) throw error;
    return data;
  });
}
```

### Example 2: Add Error Tracking to Screen Action

```typescript
// In any screen component
import { captureException } from '../lib/sentryHelpers';

const handleSubmit = async () => {
  try {
    await submitData();
  } catch (error) {
    Alert.alert('Error', 'Failed to submit');
    captureException(error as Error, {
      feature: 'submit_data',
      tags: { screen: 'CreateProfile' },
    });
  }
};
```

## ✅ Summary

**You're already set up!** Most errors are caught automatically. Only add manual tracking for:
- Critical operations you want extra context on
- API calls you want performance tracking for
- User actions you want to track as breadcrumbs

**Next Steps:**
1. Run the test utility to verify
2. Check your Sentry dashboard
3. (Optional) Add `trackAPICall` to important API functions
4. Monitor Sentry for real errors

Your setup is comprehensive - you don't need to add Sentry to every screen!

