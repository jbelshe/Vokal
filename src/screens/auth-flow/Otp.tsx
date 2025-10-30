import React from 'react';
import { View, Image, Button, Text, ImageBackground, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '@/assets/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function Otp({ navigation }: Props) {

  return (
    <ImageBackground 
    source={require('../../assets/images/bg-top-gradient.png')} 
    style={styles.background}>
      <View style={styles.topContainer}>
              <Image
                source={require('../../assets/icons/vokal-icon-no-bg.png')}
                style={styles.logo}
              />
          <Text style={[theme.textStyles.headline1, { textAlign: 'left', width: '100%'}]}>Enter your 6-digit code</Text>
          <Text style={[theme.textStyles.body, { textAlign: 'left', width: '100%'}]}>We sent your code to (555) 123-4567</Text>
          <Button title="Next" onPress={() => navigation.navigate('CreateProfile1')} />

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
  topContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 80,
  },  
  logo: {
    width: '40%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 8,
  },
});
