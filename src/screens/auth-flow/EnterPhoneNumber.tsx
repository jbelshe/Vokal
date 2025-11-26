import React from 'react';
import { View, Button, Text, Image, ImageBackground, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import { RoundNextButton } from '../../components/RoundNextButton';
import { useAuth } from '../../context/AuthContext';
import { TouchableWithoutFeedback } from 'react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'EnterPhoneNumber'>;

export default function EnterPhoneNumber({ navigation }: Props) {
  const { state, handleSendOtp } = useAuth();

  const [phoneNumberLocal, setPhoneNumberLocal] = React.useState('');
  const [isValid, setIsValid] = React.useState(false);

  const handlePhoneChange = (text: string) => {
    // Basic phone number validation (10 digits)
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumberLocal(cleaned);
    setIsValid(cleaned.length === 10);
  };

  const formatPhoneNumber = (text: string) => {
    // Format as (XXX) XXX-XXXX
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? match[1]
        : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return text;
  };

  const handleNext = () => {
    if (isValid) {
      try {
        handleSendOtp("1" + phoneNumberLocal);
      } catch (error) {
        console.error('Error checking if user exists:', error);
      }
      navigation.navigate('OTP');
    }
  };

  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../../assets/images/bg-top-gradient.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/icons/vokal-icon-no-bg.png')}
            style={styles.logo}
          />
          <View style={styles.content}>
            <Text style={[theme.textStyles.headline1, { textAlign: 'left' }]}>
              What's your mobile number?
            </Text>

            <Text style={[theme.textStyles.body, { textAlign: 'left', marginBottom: 24 }]}>
              We'll text you a verification code
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+1</Text>
              <TextInput
                style={[styles.input, !isValid && phoneNumberLocal.length > 0 && styles.inputError]}
                placeholder="(555) 123-4567"
                placeholderTextColor={theme.colors.secondary_text}
                keyboardType="phone-pad"
                onSubmitEditing={handleNext}
                returnKeyLabel="Done"
                value={formatPhoneNumber(phoneNumberLocal)}
                onChangeText={handlePhoneChange}
                maxLength={14} // (XXX) XXX-XXXX
                autoFocus
              />
            </View>
            {!isValid && phoneNumberLocal.length > 0 && (
              <Text style={styles.errorText}>Please enter a valid 10-digit phone number</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <RoundNextButton onPress={handleNext} disabled={!isValid} />
        </View>
    </ImageBackground>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
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
  content: {
    width: '100%',
    marginTop: 20,
  },
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface1,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 18,
    color: '#000',
    marginRight: 12,
    paddingRight: 12,
    paddingVertical: 8,
    borderRightWidth: 2,
    borderRightColor: '#E0E0E0',
    textAlignVertical: 'center',
    fontFamily: 'System',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: '#000',
    fontFamily: 'System',
    paddingVertical: 12,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    alignItems: 'flex-end',  // Align to the right
  },

});