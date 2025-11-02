import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
      <ActivityIndicator />
    </View>
  );
}

export default function RootNavigator() {
  const { user, loading, isOnboarding, session } = useAuth();

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        {!!loading ? (
          <Splash />
        ) : (isOnboarding) ? (
          <AuthStack />
        ) : (
          <AppStack />
        )}
      </View>
    </NavigationContainer>
  );
}


