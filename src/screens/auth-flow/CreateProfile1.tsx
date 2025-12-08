import React, { useState, useEffect } from 'react';
import { View, Image, Text, ImageBackground, StyleSheet, TextInput, Platform, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import { RoundNextButton } from '../../components/RoundNextButton';
import { useAuth } from '../../context/AuthContext';
import { useRef } from 'react';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateProfile1'>;

export default function CreateProfile1({ navigation }: Props) {
  const { state, dispatch } = useAuth();

  const [firstName, setFirstName] = React.useState(state.profile?.firstName || '');
  const [lastName, setLastName] = React.useState(state.profile?.lastName || '');
  const [contentError, setContentError] = React.useState<string | null>(null);

  const input1Ref = useRef<TextInput>(null);
  const input2Ref = useRef<TextInput>(null);


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

  // Update local state when profile changes
  React.useEffect(() => {
    if (state.profile) {
      setFirstName(state.profile.firstName || '');
      setLastName(state.profile.lastName || '');
    }
  }, [state.profile]);

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setContentError('Please enter both first and last name');
      return;
    }
    setContentError(null);
    dispatch({ type: 'SET_PROFILE', payload: { firstName, lastName }, msg: "CreateProfile1 Call" });
    console.log("Navigating to CreateProfile2")
    navigation.navigate('CreateProfile2');
  };

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
          <Text style={[theme.textStyles.headline1, { textAlign: 'left', width: '100%', marginBottom: 16 }]}>
            What's your name?
          </Text>
          <TextInput
            ref={input1Ref}
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={theme.colors.secondary_text}
            value={firstName}
            returnKeyType="next"
            onChangeText={setFirstName}
            autoCapitalize="words"
            onSubmitEditing={() => input2Ref.current?.focus()}
          />
          <TextInput
            ref={input2Ref}
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Last Name"
            placeholderTextColor={theme.colors.secondary_text}
            value={lastName}
            returnKeyType={firstName ? "done" : "previous"}
            onChangeText={setLastName}
            autoCapitalize="words"
            onSubmitEditing={firstName ? handleNext : () => input1Ref.current?.focus()}
          />
          {contentError && (
            <Text
              style={[
                theme.textStyles.body,
                { color: theme.colors.error, marginTop: 8 },
              ]}
            >
              {contentError}
            </Text>
          )}
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.buttonContainer}>
           <View style={[
                      styles.buttonContainer,
                      { paddingBottom: keyboardVisible ? 10 : 40, paddingRight: keyboardVisible ? 10 : 20 }
                    ]}>
                        <RoundNextButton onPress={handleNext} disabled={!firstName.trim() || !lastName.trim()} />
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
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',  // optional: adds a dim overlay for readability
    padding: 24,
    borderRadius: 12,
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    alignItems: 'flex-end',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    paddingHorizontal: 20,
    color: theme.colors.primary_text,
    fontSize: 16,
    fontFamily: 'System',
  },
});
