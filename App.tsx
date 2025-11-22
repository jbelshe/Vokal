import React, { useEffect, useState } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { VotingProvider } from './src/context/VotingContext';
import { FontLoader } from './src/components/FontLoader';

export default function App() {

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
}
