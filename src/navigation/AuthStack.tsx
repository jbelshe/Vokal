import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import EnterPhoneNumber from '../screens/auth-flow/EnterPhoneNumber';
import Otp from '../screens/auth-flow/Otp';
import CreateProfile1 from '../screens/auth-flow/CreateProfile1';
import CreateProfile2 from '../screens/auth-flow/CreateProfile2';
import Onboarding1 from '../screens/auth-flow/onboarding-flow/Onboarding1';
import Onboarding2 from '../screens/auth-flow/onboarding-flow/Onboarding2';
import Onboarding3 from '../screens/auth-flow/onboarding-flow/Onboarding3';
import Onboarding4 from '../screens/auth-flow/onboarding-flow/Onboarding4';
import VotingResults from '../screens/VotingResultsScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  
  return (
    <Stack.Navigator
      // initialRouteName="VotingResults"
      initialRouteName="EnterPhoneNumber"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
        gestureEnabled: true,  
        animationTypeForReplace: 'push', 
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="VotingResults" component={VotingResults} />
      <Stack.Screen name="EnterPhoneNumber" component={EnterPhoneNumber} />
      <Stack.Screen name="OTP" component={Otp} />
      <Stack.Screen name="CreateProfile1" component={CreateProfile1} />
      <Stack.Screen name="CreateProfile2" component={CreateProfile2} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Onboarding4" component={Onboarding4} />
    </Stack.Navigator>
  );
}
