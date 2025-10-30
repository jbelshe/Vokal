import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FontLoader } from './src/components/FontLoader';

export default function App() {
  return (
    <FontLoader>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </FontLoader>
  );
}
