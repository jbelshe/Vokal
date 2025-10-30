import React from 'react';
import { View, Image, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '@/assets/theme';
import { RoundNextButton } from '../../components/RoundNextButton';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function Otp({ navigation }: Props) {
  const [value, setValue] = React.useState('');
  const [resendDisabled, setResendDisabled] = React.useState(false);
  const [countdown, setCountdown] = React.useState(30);
  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });


  const { phoneNumber } = useAuth();

  // We can safely assert that phoneNumber is not null here because this component
  // is only shown after the phone number has been set in the auth flow.
  const safePhoneNumber = phoneNumber!;

  const isCodeComplete = value.length === 6;

  const handleResendCode = () => {
    if (resendDisabled) return;

    // Reset countdown and disable resend button for 30 seconds
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

    // TODO: Implement actual resend code logic here
    console.log('Resending verification code...');
  };

  const handleNext = () => {
    if (isCodeComplete) {
      navigation.navigate('CreateProfile1');
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

  React.useEffect(() => {
    if (isCodeComplete) {
      handleNext();
    }
  }, [value, isCodeComplete]);

  return (
    <ImageBackground
      source={require('../../assets/images/bg-top-gradient.png')}
      style={styles.background}>
      <View style={styles.topContainer}>
        <Image
          source={require('../../assets/icons/vokal-icon-no-bg.png')}
          style={styles.logo}
        />
        <Text style={[theme.textStyles.headline1, { textAlign: 'left', width: '100%' }]}>Enter your 6-digit code</Text>
        <Text style={[theme.textStyles.body, { textAlign: 'left', width: '100%', marginBottom: 32 }]}>We sent your code to {formatPhoneNumber(safePhoneNumber)}</Text>

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={6}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
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
      <View style={styles.buttonContainer}>
        <RoundNextButton onPress={handleNext} disabled={!isCodeComplete} />
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
