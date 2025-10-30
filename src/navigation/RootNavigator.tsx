import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        {!!loading ? (
          <Splash />
        ) : user !== null ? (
          <AppStack />
        ) : (
          <AuthStack />
        )}
      </View>
    </NavigationContainer>
  );
}
