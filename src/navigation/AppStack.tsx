import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import ProfileScreen from '../screens/settings-flow/ProfileScreen';
import SettingsMainScreen from '../screens/settings-flow/SettingsMainScreen';
import ContactUsScreen from '../screens/settings-flow/ContactUsScreen';
import VoteHistoryScreen from '../screens/settings-flow/VoteHistoryScreen';
import { AppStackParamList } from '../types/navigation';
import VotingStack from './VotingStack';
import VotingResultsScreen from '../screens/VotingResultsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' }
    }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="SettingsMain" component={SettingsMainScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="VoteHistory" component={VoteHistoryScreen} />
      <Stack.Screen 
        name="VotingResults" 
        component={VotingResultsScreen} 
        options={{ 
          headerShown: false ,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="VotingFlow" 
        component={VotingStack} 
        options={{ 
          headerShown: false ,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
