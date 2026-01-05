import React, { useEffect, useState } from 'react';
import { View, Image, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert, Keyboard, Platform, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '@/assets/theme';
import { RoundNextButton } from '../../components/RoundNextButton';
import { useAuth } from '@/context/AuthContext';
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';


type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function Otp({ navigation }: Props) {
  const analytics = usePostHogAnalytics();
  const [otpValue, setOtpValue] = React.useState('');
  const [resendDisabled, setResendDisabled] = React.useState(false);
  const [countdown, setCountdown] = React.useState(30);
  const [error, setError] = React.useState<string | null>(null);
  const ref = useBlurOnFulfill({ value: otpValue, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otpValue,
    setValue: setOtpValue,
  });

  const forceCreateProfile = false;  // only set 


  const {state, handleVerifyOtp , handleSendOtp} = useAuth();

  // We can safely assert that phoneNumber is not null here because this component
  // is only shown after the phone number has been set in the auth flow.
  const safePhoneNumber = state.profile?.phoneNumber!;

  const isCodeComplete = otpValue.length === 6;

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => setKeyboardVisible(true)
      );
      const keyboardDidHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => setKeyboardVisible(false)
      );
  
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

  const handleResendCode = () => {
    if (resendDisabled) return;

    // Reset countdown and disable resend button for 30 seconds
    console.log('Resending verification code...');
    handleSendOtp(safePhoneNumber);
    analytics.trackOTPRerequested(safePhoneNumber);
    setResendDisabled(true);
    setCountdown(30);

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    console.log('Resending verification code...');
  };

  const handleNext = async () => {
    if (!isCodeComplete) return;

    if (forceCreateProfile) {
      navigation.navigate('CreateProfile1');
      return;
    }
    
    setError(null);
    try {
      const success = await handleVerifyOtp(otpValue);
      console.log("handleVerifyOtp success: ", success);
      
      if (success == 1) {     
        console.log("handleVerifyOtp success, onboarding: ", state.isOnboarding);
        analytics.trackOTPVerified();
        navigation.navigate('CreateProfile1'); // if user exists, AuthContext sends them to HomeScreen
        
      } else if (success == 0) {
          console.log("handleVerifyOtp success, no onboarding: ", success);
          analytics.trackOTPVerified();
          setTimeout(() => {
            console.log("Waiting....")
            // wait until the auth context has updated the state.  Navigation will automatically switch to AppContext
          }, 5000);
      }
      else if (success < 0) {
        Alert.alert(
          'Incorrect Code',
          'The verification code you entered is incorrect. Please try again.',
          [{ text: 'OK', onPress: () => setOtpValue('') }]
        );
        analytics.trackOTPFailed();
      }
      else { 
        console.log("Unknown error from handleVerifyOtp - check handleVerifyOtp logic in Otp.tsx: ", success);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert(
        'Error',
        'There was a problem verifying your code. Please try again.'
      );
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    if (!cleaned) return '';
    
    // For US numbers, we'll assume +1 if not provided
    const countryCode = cleaned.length > 10 ? cleaned.slice(0, -10) : '1';
    const areaCode = cleaned.slice(-10, -7) || '';
    const firstPart = cleaned.slice(-7, -4) || '';
    const secondPart = cleaned.slice(-4) || '';
    
    let formatted = `+${countryCode}`;
    if (areaCode) formatted += ` (${areaCode})`;
    if (firstPart) formatted += ` ${firstPart}`;
    if (secondPart) formatted += ` ${secondPart}`;
    
    return formatted;
  };


  useEffect(() => {
    if (isCodeComplete) {
      handleNext();
    }
  }, [otpValue, isCodeComplete]);

  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ImageBackground
      source={require('../../assets/images/bg-top-gradient.png')}
      style={styles.background}>
      <View style={styles.topContainer}>
        <Image
          source={require('../../assets/icons/vokal-icon-no-bg.png')}
          style={styles.logo}
        />
        <Text style={[theme.textStyles.headline1, { textAlign: 'left', width: '100%' }]}>Enter your 6-digit code</Text>
        <Text style={[theme.textStyles.body, { textAlign: 'left', width: '100%', marginBottom: 16 }]}>We sent your code to {formatPhoneNumber(safePhoneNumber)}</Text>
        {error && (
          <Text style={[theme.textStyles.body, { color: 'red', marginBottom: 16, width: '100%' }]}>
            {error}
          </Text>
        )}

        <CodeField
          ref={ref}
          {...props}
          value={otpValue}
          onChangeText={setOtpValue}
          cellCount={6}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          returnKeyLabel="Done"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={resendDisabled}
          style={styles.resendButton}
        >
          <Text style={[
            theme.textStyles.body,
            styles.resendText,
            resendDisabled && styles.resendTextDisabled
          ]}>
            {resendDisabled ? `Resend code in ${countdown}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.buttonContainer}>
        <View style={[
            styles.buttonContainer,
            { paddingBottom: keyboardVisible ? 10 : 40, paddingRight: keyboardVisible ? 10 : 20 }
          ]}>
          <RoundNextButton onPress={handleNext} disabled={!isCodeComplete} />
        </View>
      </KeyboardAvoidingView>

    </ImageBackground>
    </TouchableWithoutFeedback>
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
  buttonContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    alignItems: 'flex-end',  
  },
  codeFieldRoot: {
    marginTop: 5,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cell: {
    width: 45,
    height: 60,
    lineHeight: 55,
    fontSize: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'center',
    borderRadius: 8,
    color: theme.colors.primary_text,
    backgroundColor: theme.colors.background,
  },
  focusCell: {
    borderColor: theme.colors.primary_gradient_end,
    borderWidth: 2,
  },
  resendButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  resendText: {
    textDecorationLine: 'underline',
    textAlign: 'left',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
});
