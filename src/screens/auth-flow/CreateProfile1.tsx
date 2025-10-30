import React from 'react';
import { View, Button, Text, ImageBackground, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateProfile1'>;

export default function CreateProfile1({ navigation }: Props) {

  return (
    <ImageBackground 
    source={require('../../assets/images/bg-top-gradient.png')} 
    style={styles.background}>
    
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text>What's your name?</Text>
        <Button title="Next" onPress={() => navigation.navigate('CreateProfile2')} />
        </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,               // fills the whole screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',  // optional: adds a dim overlay for readability
    padding: 24,
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
});
