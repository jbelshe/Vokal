import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { VotingProvider } from './src/context/VotingContext';
import { FontLoader } from './src/components/FontLoader';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://05eba024ad9cf8fb1e303c53d31b39d5@o4510541485834240.ingest.us.sentry.io/4510541486882816',
  sendDefaultPii: true,
  enableLogs: true,
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1,
  // integrations: [Sentry.mobileReplayIntegration()],
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  return (
    <FontLoader>
      <AuthProvider>
        <AppProvider>
          <VotingProvider>
            <RootNavigator />
          </VotingProvider>
        </AppProvider>
      </AuthProvider>
    </FontLoader>
  );
});
