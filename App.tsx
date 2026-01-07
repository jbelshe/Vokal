import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { VotingProvider } from './src/context/VotingContext';
import { FontLoader } from './src/components/FontLoader';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';

// Try to import Constants, but make it optional
let Constants: any;
try {
  Constants = require('expo-constants').default;
} catch {
  // expo-constants not available, use fallback
  Constants = null;
}

// Initialize Sentry with best practices
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Environment configuration
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__, // Enable debug mode in development
  
  // Session tracking
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000, // 30 seconds
  
  // Performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
  
  // Native crash handling
  enableNativeCrashHandling: true,
  enableNativeNagger: false, // Disable native error dialog (we'll handle UI ourselves)
  
  // Stack traces and context
  attachStacktrace: true,
  sendDefaultPii: false, // Set to false for privacy (change if you need PII)
  
  // Release tracking - helps associate errors with app versions
  release: Constants?.expoConfig?.version || '1.0.0',
  dist: Constants?.expoConfig?.ios?.buildNumber || Constants?.expoConfig?.android?.versionCode?.toString() || undefined,
  
  // Filter out unwanted errors
  beforeSend(event, hint) {
    // Filter out network errors that are expected (e.g., offline scenarios)
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send network errors for offline scenarios (optional - adjust based on your needs)
        if (error.message?.includes('Network request failed') && !__DEV__) {
          return null; // Don't send this event
        }
      }
    }
    
    // Add app context
    if (event.contexts && Constants) {
      event.contexts.app = {
        ...event.contexts.app,
        appVersion: Constants.expoConfig?.version,
        buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode,
      };
    }
    
    return event;
  },
  
  // Enable Spotlight in development for local debugging
  // spotlight: __DEV__, // Uncomment if you want Spotlight integration
});

export default Sentry.wrap(function App() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: 'https://us.i.posthog.com',
        enableSessionReplay: false,
      }}
      autocapture={false}
    >
      <FontLoader>
        <AuthProvider>
          <AppProvider>
            <VotingProvider>
              <RootNavigator />
            </VotingProvider>
          </AppProvider>
        </AuthProvider>
      </FontLoader>
    </PostHogProvider>
  );
});
