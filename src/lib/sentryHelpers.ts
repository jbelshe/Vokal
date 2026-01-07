import * as Sentry from '@sentry/react-native';

/**
 * Helper functions for common Sentry operations
 */

/**
 * Capture an exception with context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: Sentry.SeverityLevel;
    feature?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      ...context?.tags,
      ...(context?.feature && { feature: context.feature }),
    },
    extra: context?.extra,
    level: context?.level || 'error',
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: Sentry.SeverityLevel;
    feature?: string;
  }
) {
  Sentry.captureMessage(message, {
    tags: {
      ...context?.tags,
      ...(context?.feature && { feature: context.feature }),
    },
    extra: context?.extra,
    level: context?.level || 'info',
  });
}

/**
 * Add a breadcrumb for user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category: string = 'user_action'
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: 'info',
    data,
  });
}

/**
 * Set user context (enhanced version of Sentry.setUser)
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  [key: string]: any;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Set screen context
 */
export function setScreenContext(screenName: string, params?: Record<string, any>) {
  Sentry.setContext('screen', {
    name: screenName,
    params,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track API call performance
 * Uses Sentry span API if available, otherwise falls back to timing with breadcrumbs
 */
export function trackAPICall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  // Try to use startSpan if available (Sentry v7+)
  if (typeof (Sentry as any).startSpan === 'function') {
    return (Sentry as any).startSpan(
      {
        name: `API: ${apiName}`,
        op: 'http.client',
      },
      async (span: any) => {
        try {
          const result = await apiCall();
          const duration = Date.now() - startTime;
          span?.setStatus?.({ code: 1, message: 'ok' }); // 1 = OK
          addBreadcrumb(`API call completed: ${apiName}`, { duration, status: 'success' }, 'api');
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          span?.setStatus?.({ code: 2, message: 'internal_error' }); // 2 = Internal Error
          addBreadcrumb(`API call failed: ${apiName}`, { duration, status: 'error' }, 'api');
          captureException(error as Error, {
            feature: 'api_call',
            tags: { apiName },
            extra: { duration },
          });
          throw error;
        }
      }
    );
  }
  
  // Fallback: Track timing with breadcrumbs
  return apiCall()
    .then((result) => {
      const duration = Date.now() - startTime;
      addBreadcrumb(`API call completed: ${apiName}`, { duration, status: 'success' }, 'api');
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      addBreadcrumb(`API call failed: ${apiName}`, { duration, status: 'error' }, 'api');
      captureException(error as Error, {
        feature: 'api_call',
        tags: { apiName },
        extra: { duration },
      });
      throw error;
    });
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: {
    feature?: string;
    tags?: Record<string, string>;
  }
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, {
        feature: context?.feature,
        tags: context?.tags,
        extra: { args: JSON.stringify(args) },
      });
      throw error;
    }
  }) as T;
}

