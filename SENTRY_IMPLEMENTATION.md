# Sentry Implementation Guide

## Current Setup ✅

Your Sentry implementation is already partially configured with:
- ✅ Basic initialization in `App.tsx`
- ✅ User ID tracking in `AuthContext`
- ✅ Metro config with Sentry Expo integration
- ✅ Expo plugin configuration in `app.json`
- ✅ Platform-specific `sentry.properties` files

## Best Practices & Improvements

### 1. Environment-Based Configuration

**Current Issue**: DSN is hardcoded and same for all environments.

**Best Practice**: Use environment variables and configure differently for dev/prod:
- **Development**: Lower sample rates, more verbose logging, Spotlight enabled
- **Production**: Higher sample rates, optimized performance, Spotlight disabled

### 2. Sentry Initialization Options

**Recommended Configuration**:
```typescript
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
  enableNativeCrashHandling: true,
  enableNativeNagger: false,
  attachStacktrace: true,
  sendDefaultPii: false, // Only set to true if you need PII
  beforeSend(event, hint) {
    // Filter out sensitive data or unwanted errors
    if (event.exception) {
      const error = hint.originalException;
      // Example: Don't send network errors for offline scenarios
      if (error?.message?.includes('Network request failed')) {
        return null; // Don't send this event
      }
    }
    return event;
  },
  integrations: [
    // Add integrations as needed
  ],
});
```

### 3. Error Boundaries

**Current**: Using `Sentry.wrap()` which provides basic error boundary.

**Best Practice**: Add custom error boundaries for better UX:
- Global error boundary with user-friendly fallback UI
- Screen-level error boundaries for critical flows
- Component-level boundaries for isolated features

### 4. Performance Monitoring

**Enable**:
- Transaction tracking for API calls
- Navigation tracking
- Screen load times
- Custom performance spans

### 5. Release Tracking

**Important**: Configure release tracking for better debugging:
- Set release version from `app.json` or `package.json`
- Associate errors with specific app versions
- Track deployment information

### 6. Context & Breadcrumbs

**Current**: Basic user context is set.

**Enhance**:
- Add navigation breadcrumbs
- Track user actions
- Add custom context (screen, feature, etc.)
- Set tags for filtering

### 7. Source Maps

**Status**: ✅ Already configured via Expo plugin.

**Verify**: Source maps should upload automatically during EAS builds.

## Implementation Checklist

- [x] Basic Sentry.init() configuration
- [x] User ID tracking
- [x] Metro config integration
- [x] Expo plugin setup
- [x] Platform properties files
- [x] Environment-based configuration (dev vs prod)
- [x] Error boundaries with fallback UI (`SentryErrorBoundary` component)
- [x] Performance monitoring (tracesSampleRate configured)
- [x] Release tracking (version and build number)
- [x] Navigation breadcrumbs (integrated in `useScreenTracking`)
- [x] Custom context/tags (screen context, error tags)
- [x] beforeSend filtering (network errors, app context)
- [x] Helper utilities (`sentryHelpers.ts`)

## Recent Improvements Made

### 1. Enhanced Sentry.init() Configuration
- ✅ Environment-based settings (dev vs prod)
- ✅ Performance monitoring with sample rates
- ✅ Release tracking with version numbers
- ✅ Error filtering with `beforeSend`
- ✅ Better context attachment

### 2. Navigation Breadcrumbs
- ✅ Integrated Sentry breadcrumbs into `useScreenTracking` hook
- ✅ Automatic screen context tracking
- ✅ Navigation event logging

### 3. Error Boundary Component
- ✅ Created `SentryErrorBoundary` component
- ✅ User-friendly fallback UI
- ✅ Automatic error reporting

### 4. Helper Utilities
- ✅ Created `sentryHelpers.ts` with common patterns
- ✅ Functions for capturing exceptions, messages, breadcrumbs
- ✅ API call performance tracking
- ✅ Error tracking wrapper functions

## Usage Examples

### Capturing Errors
```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'authentication' },
    extra: { userId: user.id },
  });
  throw error;
}
```

### Capturing Messages
```typescript
Sentry.captureMessage('User completed onboarding', {
  level: 'info',
  tags: { feature: 'onboarding' },
});
```

### Adding Breadcrumbs
```typescript
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to PropertyDetails',
  level: 'info',
  data: { propertyId: '123' },
});
```

### Setting Context
```typescript
Sentry.setContext('screen', {
  name: 'PropertyDetails',
  propertyId: '123',
});
```

### Performance Tracking
```typescript
const transaction = Sentry.startTransaction({
  name: 'Load Property Details',
  op: 'navigation',
});

// ... your code ...

transaction.finish();
```

## Security Considerations

1. **DSN**: Never commit DSN to public repos (use env vars)
2. **PII**: Be careful with `sendDefaultPii: true` - only enable if needed
3. **Filtering**: Use `beforeSend` to filter sensitive data
4. **Source Maps**: Keep source maps private (handled by Sentry)

## Next Steps

1. Move DSN to environment variable
2. Enhance initialization with recommended options
3. Add error boundaries with fallback UI
4. Add navigation breadcrumbs
5. Enable performance monitoring
6. Configure release tracking

