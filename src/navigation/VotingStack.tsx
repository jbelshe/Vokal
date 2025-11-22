// src/navigation/VotingStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import CategoryScreen from '../screens/voting-flow/CategoryScreen';
import SubCategoryScreen from '../screens/voting-flow/SubCategoryScreen';
import AdditionalNoteScreen from '../screens/voting-flow/AdditionalNoteScreen';
import { VotingStackParamList } from '../types/navigation';

// Define the parameter list for the voting flow


const Stack = createNativeStackNavigator<VotingStackParamList>();

export default function VotingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'fade',
        animationDuration: 200,
      }}
      initialRouteName="Category"
    >
      <Stack.Screen 
        name="Category" 
        component={CategoryScreen}
      />
      <Stack.Screen name="SubCategory" component={SubCategoryScreen} />
      <Stack.Screen name="AdditionalNote" component={AdditionalNoteScreen} />
    </Stack.Navigator>
  );
}