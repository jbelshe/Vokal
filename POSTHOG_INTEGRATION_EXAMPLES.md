# PostHog Integration Examples

This document shows practical examples of how to integrate PostHog tracking throughout your application.

## 1. Update RootNavigator for Screen Tracking

Update `src/navigation/RootNavigator.tsx` to automatically track screen views:

```typescript
import { useScreenTracking } from '../hooks/useScreenTracking';

export default function RootNavigator() {
  const { state } = useAuth();
  const { onStateChange } = useScreenTracking();

  // ... existing code ...

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <PostHogProvider
        apiKey="phc_fNTrxQcWb0h53CW1tyPPSNbgWYX9ChvuATuYjYMDI7E"
        options={{
          host: 'https://us.i.posthog.com',
          enableSessionReplay: false,
        }}
        autocapture={false}
      >
        {!state.isAuthenticated || state.isOnboarding ? (<AuthStack />) : (<AppStack />)}
      </PostHogProvider>
    </NavigationContainer>
  );
}
```

## 2. Add User Identification in AuthContext

Update `src/context/AuthContext.tsx` to identify users when they log in:

```typescript
import { usePostHogAnalytics } from '../hooks/usePostHogAnalytics';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const analytics = usePostHogAnalytics();
  
  // In handleSessionChange, after profile is loaded:
  if (userProfile && userProfile.firstName) {
    // Identify user with PostHog
    analytics.identifyUser(userProfile.userId, {
      email: userProfile.email || undefined,
      firstName: userProfile.firstName,
      zipCode: userProfile.zipCode || undefined,
    });
    analytics.trackSignIn(userProfile.userId);
    
    dispatch({ type: 'SET_PROFILE', payload: userProfile, msg: source });
    // ... rest of code
  }
  
  // In signOut function:
  const signOut = async () => {
    analytics.trackSignOut();
    // ... rest of sign out code
  };
}
```

## 3. Track Authentication Events

### In OTP Screen (`src/screens/auth-flow/Otp.tsx`):

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function Otp({ navigation }: Props) {
  const analytics = usePostHogAnalytics();
  const { handleVerifyOtp } = useAuth();

  const handleVerify = async (otp: string) => {
    analytics.trackOTPVerified();
    const success = await handleVerifyOtp(otp);
    // ... rest of code
  };
}
```

### In EnterPhoneNumber Screen:

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function EnterPhoneNumber({ navigation }: Props) {
  const analytics = usePostHogAnalytics();
  const { handleSendOtp } = useAuth();

  const handleSendOTP = async (phoneNumber: string) => {
    analytics.trackOTPRequested(phoneNumber);
    await handleSendOtp(phoneNumber);
    // ... rest of code
  };
}
```

### After Profile Creation:

In `src/context/AuthContext.tsx`, in the `saveNewProfileToDatabase` function:

```typescript
const analytics = usePostHogAnalytics();

const saveNewProfileToDatabase = async (profile: Profile) => {
  // ... existing save logic ...
  
  if (success) {
    analytics.trackProfileCreated(profile.userId, {
      hasEmail: !!profile.email,
      hasZipCode: !!profile.zipCode,
    });
  }
};
```

## 4. Track Voting Flow Events

### When Voting Flow Starts (`src/screens/PropertyDetailsScreen.tsx`):

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const analytics = usePostHogAnalytics();
  const { currentPropertyId } = useAppContext();

  useEffect(() => {
    if (currentPropertyId) {
      analytics.trackPropertyViewed(currentPropertyId, 'property_details');
    }
  }, [currentPropertyId]);

  const handleSubmitSuggestion = () => {
    if (currentPropertyId) {
      analytics.trackVotingFlowStarted(currentPropertyId);
    }
    navigation.push('VotingFlow');
  };
}
```

### Track Category Selection (`src/screens/voting-flow/CategoryScreen.tsx`):

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function CategoryScreen({ navigation }: Props) {
  const analytics = usePostHogAnalytics();
  const { setCategorySelected } = useVotingContext();

  const handleCategoryPress = (categoryCode: string) => {
    analytics.trackCategorySelected(categoryCode);
    setCategorySelected(categoryCode);
    navigation.navigate('SubCategory', { categorySelected: categoryCode });
  };
}
```

### Track Subcategory Selection (`src/screens/voting-flow/SubCategoryScreen.tsx`):

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function SubCategoryScreen({ navigation, route }: Props) {
  const analytics = usePostHogAnalytics();
  const { categorySelected } = route.params;
  const { setSubCategorySelected } = useVotingContext();

  const handleSubcategoryPress = (subcategoryCode: string) => {
    analytics.trackSubcategorySelected(subcategoryCode, categorySelected);
    setSubCategorySelected(subcategoryCode);
    navigation.navigate('AdditionalNote', { subCategorySelected: subcategoryCode });
  };
}
```

### Track Vote Submission (`src/screens/voting-flow/AdditionalNoteScreen.tsx`):

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function AdditionalNoteScreen({ navigation, route }: Props) {
  const analytics = usePostHogAnalytics();
  const { currentPropertyId, subcategoryToIdMap, idToCategoryMap } = useAppContext();
  const { categorySelected, additionalNote } = useVotingContext();
  const { subCategorySelected } = route.params;

  const handleSendVote = async () => {
    const success = await submitVote(/* ... existing params ... */);
    
    if (success && currentPropertyId) {
      // Track vote submission
      analytics.trackVoteSubmitted({
        propertyId: currentPropertyId,
        categoryCode: categorySelected!,
        subcategoryCode: subCategorySelected,
        hasNote: !!additionalNote && additionalNote.trim().length > 0,
      });
      
      analytics.trackVotingFlowCompleted(currentPropertyId);
    }
    
    // ... rest of code
  };
}
```

### Track Voting Flow Abandonment

Add to voting screens when user closes/goes back:

```typescript
const handleClose = () => {
  if (currentPropertyId) {
    analytics.trackVotingFlowAbandoned(currentPropertyId, 'additional_note');
  }
  resetVoting();
  navigation.getParent()?.goBack();
};
```

## 5. Track Settings Changes

In `src/screens/settings-flow/SettingsMainScreen.tsx`:

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function SettingsMainScreen({ navigation }: Props) {
  const analytics = usePostHogAnalytics();

  const handleNotificationsToggle = async (enabled: boolean) => {
    // ... existing toggle logic ...
    analytics.trackSettingsChanged('notifications_enabled', enabled);
  };

  const handleEmailSubscriptionToggle = async (subscribed: boolean) => {
    // ... existing toggle logic ...
    analytics.trackSettingsChanged('email_subscription', subscribed);
  };
}
```

## 6. Track Profile Updates

In `src/screens/settings-flow/ProfileScreen.tsx`:

```typescript
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

export default function ProfileScreen({ navigation }: Props) {
  const analytics = usePostHogAnalytics();

  const handleSaveProfile = async (updatedFields: Partial<Profile>) => {
    // ... existing save logic ...
    
    const updatedFieldNames = Object.keys(updatedFields);
    analytics.trackProfileUpdated(updatedFieldNames);
  };
}
```

## 7. Environment-Based Configuration (Optional)

You may want to disable PostHog in development. Update `RootNavigator.tsx`:

```typescript
const isDevelopment = __DEV__;

return (
  <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
    {isDevelopment ? (
      // Skip PostHogProvider in development
      !state.isAuthenticated || state.isOnboarding ? (<AuthStack />) : (<AppStack />)
    ) : (
      <PostHogProvider
        apiKey="phc_fNTrxQcWb0h53CW1tyPPSNbgWYX9ChvuATuYjYMDI7E"
        options={{
          host: 'https://us.i.posthog.com',
          enableSessionReplay: false,
        }}
        autocapture={false}
      >
        {!state.isAuthenticated || state.isOnboarding ? (<AuthStack />) : (<AppStack />)}
      </PostHogProvider>
    )}
  </NavigationContainer>
);
```

Or use an environment variable:

```typescript
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const ENABLE_POSTHOG = !__DEV__ || process.env.EXPO_PUBLIC_ENABLE_POSTHOG_DEV === 'true';
```

## Implementation Priority

1. **Start with**: User identification in AuthContext
2. **Then add**: Screen view tracking in RootNavigator
3. **Next**: Track vote submissions (most important business metric)
4. **Then**: Track authentication events
5. **Finally**: Add other events as needed

## Testing

After implementing, verify events are being tracked:
1. Open PostHog dashboard
2. Navigate to "Live Events" or "Events"
3. Use the app and verify events appear
4. Check that user identification is working by viewing user profiles

