import React from 'react';
import { View, Image, Text, ImageBackground, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { RoundNextButton } from '../../components/RoundNextButton';
import { TextInput, View as RNView, Platform } from 'react-native';
import { theme } from '../../assets/theme';
import { Dropdown } from 'react-native-element-dropdown';
import BackIcon from '../../assets/icons/chevron-left.svg';
import { useMemo, useState } from 'react';
import Checkbox from 'expo-checkbox';
import { Profile } from '../../types/profile';
import { Birthday } from '../../types/birthday';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateProfile2'>;

// Helper function to extract birthday values from Profile's Birthday type
const parseBirthdayFromProfile = (birthday: Birthday | null | undefined): { month: number | null; day: number | null; year: number | null } => {
  if (!birthday) {
    return { month: null, day: null, year: null };
  }

  // Handle { isoDate: string } format
  if ('isoDate' in birthday) {
    const date = new Date(birthday.isoDate);
    if (!isNaN(date.getTime())) {
      return {
        month: date.getMonth() + 1, // JavaScript months are 0-indexed
        day: date.getDate(),
        year: date.getFullYear()
      };
    }
    return { month: null, day: null, year: null };
  }

  // Handle { month, day, year } format
  return {
    month: birthday.month || null,
    day: birthday.day || null,
    year: birthday.year || null
  };
};

export default function CreateProfile2({ navigation }: Props) {
  const { state, dispatch, saveNewProfileToDatabase } = useAuth();
  const [selectedGender, setSelectedGender] = React.useState<string>(state.profile?.gender || '');
  const [email, setEmail] = React.useState(state.profile?.email || '');
  const [zipCode, setZipCode] = React.useState(state.profile?.zipCode || '');
  const [birthDay, setBirthDay] = React.useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.day;
  });
  const [birthMonth, setBirthMonth] = React.useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.month;
  });
  const [birthYear, setBirthYear] = React.useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.year;
  });
  const [contentError, setContentError] = React.useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  // Sync local state when profile changes
  React.useEffect(() => {
    console.log('Profile changed:', state.profile);
    if (state.profile) {
      setEmail(state.profile.email || '');
      setZipCode(state.profile.zipCode || '');
      setSelectedGender(state.profile.gender || '');
      const parsed = parseBirthdayFromProfile(state.profile.birthday);
      setBirthMonth(parsed.month);
      setBirthDay(parsed.day);
      setBirthYear(parsed.year);
      setIsChecked(state.profile.emailSubscribed || false);

    }
  }, [state.profile]);

  const handleNext = async () => {
    console.log("Navigating to next")
    // Reset previous errors
    setContentError(null);

    if (zipCode.length !== 5) {
      setContentError('Please enter a valid zip code');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setContentError('Please enter a valid email address');
      return;
    }

    // Check if all birthday fields are filled
    if (!birthDay || !birthMonth || !birthYear) {
      setContentError('Please enter a complete date of birth');
      return;
    }

    // Check if date is valid
    const date = new Date(birthYear, birthMonth - 1, birthDay);
    const isValidDate = (
      date.getFullYear() === birthYear &&
      date.getMonth() === birthMonth - 1 &&
      date.getDate() === birthDay
    );

    if (!isValidDate) {
      setContentError('Please enter a valid date of birth');
      return;
    }

    const updatedProfile: Profile = {
      phoneNumber: state.profile?.phoneNumber ?? null,
      firstName: state.profile?.firstName ?? null,
      lastName: state.profile?.lastName ?? null,
      email: email ?? null,
      zipCode: zipCode ?? null,
      gender: selectedGender ?? null,
      birthday: {
        month: birthMonth,
        day: birthDay,
        year: birthYear
      } as const,
      emailSubscribed: isChecked,
      userId: state.profile?.userId ?? null,
      role: state.profile?.role ?? null
    };

    dispatch({ type: "SET_PROFILE", payload: updatedProfile, msg: "CreateProfile Call" });
    try {
      const success = await saveNewProfileToDatabase(updatedProfile);
      if (!success) {
        setContentError('Failed to save profile. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setContentError('Failed to save profile. Please try again.');
      return;
    }
    // If date is valid and profile saved, proceed with sign in
    // signIn(state.session?.access_token!);
    console.log("Navigating to onboarding...");
    navigation.navigate('Onboarding1');
  };

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ]

  const days = useMemo(() => {
    let numDays;
    if (!birthMonth) {
      numDays = 31;
    }
    else {
      if (!birthYear) {
        numDays = new Date(2024, birthMonth, 0).getDate(); // default to year w/ Feb 29
      }
      else {
        numDays = new Date(birthYear, birthMonth, 0).getDate();  // get num of days for year w/ or w/o Feb 29
      }

      if (birthDay && birthDay > numDays) {
        setBirthDay(numDays);
      }
    }

    return Array.from({ length: numDays }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1
    }));
  }, [birthMonth, birthYear]);

  const currentYear = new Date().getFullYear() - 13;
  const years = Array.from({ length: 110 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: currentYear - i
  }));


  const handleBack = () => {
    // Save current form data before going back
    if (birthDay && birthMonth && birthYear) {
      const birthdayData: Birthday = {
        month: birthMonth,
        day: birthDay,
        year: birthYear
      };
      dispatch({
        type: 'SET_PROFILE', payload: {
          email,
          zipCode,
          gender: selectedGender,
          birthday: birthdayData,
          emailSubscribed: isChecked
        }
      });
    } else {
      // Still save other fields even if birthday is incomplete
      dispatch({
        type: 'SET_PROFILE', payload: {
          email,
          zipCode,
          gender: selectedGender,
          emailSubscribed: isChecked
        }
      });
    }
    console.log("Navigating back to CreateProfile1")
    navigation.navigate('CreateProfile1');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../../assets/images/bg-top-gradient.png')}
        style={styles.background}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <BackIcon width={45} height={45} fill="black" />
        </TouchableOpacity>

        <KeyboardAvoidingView style={styles.topContainer}>
          <Image
            source={require('../../assets/icons/vokal-icon-no-bg.png')}
            style={styles.logo}
          />
          <Text style={[theme.textStyles.headline1, { textAlign: 'left', width: '100%', marginBottom: 16 }]}>
            Let's create your profile
          </Text>
          <Text style={[theme.textStyles.body, { textAlign: 'left', width: '100%', marginBottom: 16 }]}>
            This helps improve voting data
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={theme.colors.secondary_text}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            placeholderTextColor={theme.colors.secondary_text}
            value={zipCode}
            onChangeText={(text) => {
              // Only allow numbers
              const formattedText = text.replace(/[^0-9]/g, '');
              // Limit to 5 digits
              if (formattedText.length <= 5) {
                setZipCode(formattedText);
              }
              if (formattedText.length === 5) {
                Keyboard.dismiss();
              }
            }}
            keyboardType="number-pad"
            maxLength={5}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={!selectedGender ? styles.placeholderStyle : styles.selectedTextStyle}
            data={genderOptions}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            value={selectedGender}
            onChange={item => setSelectedGender(item.value)}
            itemTextStyle={styles.selectedTextStyle}
            itemContainerStyle={styles.dropdownOptionContainer}
            containerStyle={styles.dropdownOption}
            activeColor={theme.colors.surface2}
          />
          <View style={styles.dateContainer}>
            <View style={[styles.dateInput, { flex: 2 }]}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={months}
                labelField="label"
                valueField="value"
                placeholder="Month"
                value={birthMonth}
                onChange={item => setBirthMonth(item.value)}
                itemTextStyle={styles.selectedTextStyle}
                itemContainerStyle={styles.dropdownOptionContainer}
                containerStyle={styles.dropdownOption}
                activeColor={theme.colors.surface2}
              />
            </View>
            <View style={[styles.dateInput, { marginHorizontal: 5, flex: 1.3 }]}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={days}
                labelField="label"
                valueField="value"
                placeholder="Day"
                value={birthDay}
                onChange={item => setBirthDay(item.value)}
                itemTextStyle={styles.selectedTextStyle}
                itemContainerStyle={styles.dropdownOptionContainer}
                containerStyle={styles.dropdownOption}
                activeColor={theme.colors.surface2}
              />
            </View>
            <View style={[styles.dateInput, { flex: 1.5 }]}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={years}
                labelField="label"
                valueField="value"
                placeholder="Year"
                value={birthYear}
                onChange={item => setBirthYear(item.value)}
                itemTextStyle={styles.selectedTextStyle}
                itemContainerStyle={styles.dropdownOptionContainer}
                containerStyle={styles.dropdownOption}
                activeColor={theme.colors.surface2}
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? theme.colors.primary_gradient_start : undefined}
              style={styles.checkbox}
            />
            <Text style={theme.textStyles.body}>Keep me in the loop about Vokal</Text>
          </View>
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
        </KeyboardAvoidingView>
        <View style={styles.buttonContainer}>
          <RoundNextButton
            onPress={handleNext}
            disabled={
              !birthMonth ||
              !birthDay ||
              !birthYear ||
              !selectedGender ||
              !email ||
              !zipCode
            }
          />
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    color: theme.colors.primary_text,
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
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
  input: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    paddingHorizontal: 20,
    color: theme.colors.primary_text,
    fontSize: 16,
    fontFamily: 'System',
    marginBottom: 16,
  },
  dropdown: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.surface1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
    justifyContent: 'center',
  },
  dropdownOption: {
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOptionContainer: {
    borderRadius: 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: theme.colors.secondary_text,
  },
  selectedTextStyle: {
    fontSize: 16, color: theme.colors.primary_text,
  },
  dateContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 4,
    borderColor: theme.colors.primary_gradient_start,
    color: theme.colors.primary_gradient_start,
  },

});
