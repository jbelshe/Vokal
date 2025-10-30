import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import EnterPhoneNumber from '../screens/auth-flow/EnterPhoneNumber';
import Otp from '../screens/auth-flow/Otp';
import CreateProfile1 from '../screens/auth-flow/CreateProfile1';
import CreateProfile2 from '../screens/auth-flow/CreateProfile2';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="EnterPhoneNumber"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      
      <Stack.Screen name="EnterPhoneNumber" component={EnterPhoneNumber} />
      <Stack.Screen name="OTP" component={Otp} />
      <Stack.Screen name="CreateProfile1" component={CreateProfile1} />
      <Stack.Screen name="CreateProfile2" component={CreateProfile2} />
    </Stack.Navigator>
  );
}
