import React from 'react';
import { View, Button, Text, ImageBackground, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();  // finds nearest AuthContext.Provider above on component tree

  return (
    <ImageBackground 
    source={require('../../assets/images/bg-top-bottom-gradient.png')} 
    style={styles.background}>
    
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text>Sign in to continue</Text>
        <Button title="Sign In (demo)" onPress={() => signIn('demo-tokexn')} />
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
