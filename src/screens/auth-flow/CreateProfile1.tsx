import React from 'react';
import { View, Image, Text, ImageBackground, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import { RoundNextButton } from '../../components/RoundNextButton';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateProfile1'>;

export default function CreateProfile1({ navigation }: Props) {
  const { profile, updateProfile } = useAuth();

  const [firstName, setFirstName] = React.useState(profile?.firstName || '');
  const [lastName, setLastName] = React.useState(profile?.lastName || '');

  // Update local state when profile changes
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
    }
  }, [profile]);

  const handleNext = () => {
    updateProfile({ firstName, lastName });
    navigation.navigate('CreateProfile2');
  };

  return (
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
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={theme.colors.secondary_text}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.secondary_text}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
      </View>
              <View style={styles.buttonContainer}>
                <RoundNextButton onPress={handleNext} disabled={!firstName || !lastName} />
              </View>
    </ImageBackground>
  );
}
12347
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
