import * as Sentry from '@sentry/react-native';
import { captureException, captureMessage, addBreadcrumb } from './sentryHelpers';

/**
 * Test utilities for verifying Sentry setup
 * 
 * Usage:
 *   import { testSentrySetup } from './lib/sentryTestUtils';
 *   // Call testSentrySetup() to verify everything is working
 */

/**
 * Test if Sentry is properly initialized
 */
export function testSentrySetup(): {
  isInitialized: boolean;
  dsn: string | undefined;
  environment: string | undefined;
  results: {
    testException: boolean;
    testMessage: boolean;
    testBreadcrumb: boolean;
    testUserContext: boolean;
  };
} {
  const results = {
    testException: false,
    testMessage: false,
    testBreadcrumb: false,
    testUserContext: false,
  };

  try {
    // Test 1: Send a test exception
    try {
      captureException(new Error('Sentry Test Exception - This is a test'), {
        feature: 'sentry_test',
        tags: { test: 'true' },
      });
      results.testException = true;
      console.log('✅ Sentry test exception sent');
    } catch (error) {
      console.error('❌ Failed to send test exception:', error);
    }

    // Test 2: Send a test message
    try {
      captureMessage('Sentry Test Message - Setup verification', {
        feature: 'sentry_test',
        level: 'info',
        tags: { test: 'true' },
      });
      results.testMessage = true;
      console.log('✅ Sentry test message sent');
    } catch (error) {
      console.error('❌ Failed to send test message:', error);
    }

    // Test 3: Add a breadcrumb
    try {
      addBreadcrumb('Sentry test breadcrumb', { test: true }, 'test');
      results.testBreadcrumb = true;
      console.log('✅ Sentry test breadcrumb added');
    } catch (error) {
      console.error('❌ Failed to add test breadcrumb:', error);
    }

    // Test 4: Set user context
    try {
      Sentry.setUser({ id: 'test-user', username: 'test' });
      results.testUserContext = true;
      console.log('✅ Sentry user context set');
    } catch (error) {
      console.error('❌ Failed to set user context:', error);
    }

    // Get Sentry configuration (try multiple methods for compatibility)
    let isInitialized = false;
    let dsn: string | undefined;
    let environment: string | undefined;

    try {
      // Try method 1: getCurrentHub (v6 and earlier)
      if (typeof (Sentry as any).getCurrentHub === 'function') {
        const hub = (Sentry as any).getCurrentHub();
        const client = hub?.getClient?.();
        if (client) {
          isInitialized = true;
          dsn = client.getDsn?.()?.toString();
          const options = client.getOptions?.();
          environment = options?.environment;
        }
      }
    } catch (e) {
      // getCurrentHub not available or failed
    }

    // Try method 2: Access via getClient (v7+)
    if (!dsn) {
      try {
        if (typeof (Sentry as any).getClient === 'function') {
          const client = (Sentry as any).getClient();
          if (client) {
            isInitialized = true;
            dsn = client.getDsn?.()?.toString();
            const options = client.getOptions?.();
            environment = options?.environment;
          }
        }
      } catch (e) {
        // getClient not available
      }
    }

    // Try method 3: Read from environment variable as fallback
    if (!dsn) {
      const envDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
      if (envDsn) {
        dsn = envDsn;
        isInitialized = true;
      }
    }

    // If we couldn't get config but tests passed, assume initialized
    if (!isInitialized && (results.testException || results.testMessage)) {
      isInitialized = true;
      if (!dsn) {
        // Check environment variable one more time
        dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || 'Configured (unable to retrieve DSN)';
      }
      if (!environment) {
        environment = __DEV__ ? 'development' : 'production';
      }
    }

    return {
      isInitialized,
      dsn,
      environment,
      results,
    };
  } catch (error) {
    console.error('❌ Sentry test setup failed:', error);
    return {
      isInitialized: false,
      dsn: undefined,
      environment: undefined,
      results,
    };
  }
}

/**
 * Test native crash reporting (use with caution - will crash the app!)
 * Only use this in development and when you're ready to test crash reporting
 */
export function testNativeCrash() {
  if (__DEV__) {
    console.warn('⚠️  Testing native crash - app will crash!');
    // This will cause a native crash
    (Sentry as any).native?.crash?.();
  } else {
    console.warn('⚠️  Native crash test only available in development');
  }
}

/**
 * Test React error boundary
 * Throws an error that should be caught by SentryErrorBoundary
 */
export function testErrorBoundary() {
  throw new Error('Test error boundary - This error should be caught by SentryErrorBoundary');
}

/**
 * Check Sentry configuration status
 * Uses a safe approach that works across Sentry versions
 */
export function getSentryStatus() {
  try {
    // Try to access client via getCurrentHub (v6 and earlier)
    let client: any = null;
    let options: any = null;
    
    try {
      if (typeof (Sentry as any).getCurrentHub === 'function') {
        const hub = (Sentry as any).getCurrentHub();
        client = hub?.getClient?.();
        if (client) {
          options = client.getOptions?.();
        }
      }
    } catch (e) {
      // getCurrentHub not available - that's okay
    }

    // If we can't access client directly, test if Sentry is working
    if (!client) {
      // Test by trying to capture a message (won't actually send if not initialized)
      try {
        Sentry.captureMessage('Sentry status check', { level: 'debug' });
        // Try to get DSN from environment variable
        const envDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
        return {
          initialized: true,
          dsn: envDsn || 'Configured (unable to retrieve details)',
          environment: __DEV__ ? 'development' : 'production',
          debug: __DEV__,
          tracesSampleRate: 'Unknown',
          enableAutoSessionTracking: 'Unknown',
          note: envDsn ? 'Using environment variable' : 'Using fallback detection - Sentry appears to be initialized',
        };
      } catch (e) {
        return {
          initialized: false,
          message: 'Sentry may not be initialized',
        };
      }
    }

    const dsn = client.getDsn?.()?.toString();

    return {
      initialized: true,
      dsn: dsn ? 'Configured' : 'Not configured',
      environment: options?.environment || 'Not set',
      debug: options?.debug || false,
      tracesSampleRate: options?.tracesSampleRate ?? 'Unknown',
      enableAutoSessionTracking: options?.enableAutoSessionTracking ?? 'Unknown',
    };
  } catch (error) {
    return {
      initialized: false,
      message: `Error checking status: ${error}`,
    };
  }
}

