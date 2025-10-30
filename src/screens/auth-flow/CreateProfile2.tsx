import React from 'react';
import { View, Image, Text, ImageBackground, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { RoundNextButton } from '../../components/RoundNextButton';
import { TextInput, View as RNView, Platform } from 'react-native';
import { theme } from '../../assets/theme';
import { Dropdown } from 'react-native-element-dropdown';
import { Birthday } from '../../types/birthday';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateProfile2'>;

export default function CreateProfile2({ navigation }: Props) {
  const { signIn } = useAuth();
  const [selectedGender, setSelectedGender] = React.useState<string>('');
  const [email, setEmail] = React.useState('');
  const [zipCode, setZipCode] = React.useState('');
  const [birthDay, setBirthDay] = React.useState<string>('');
  const [birthMonth, setBirthMonth] = React.useState<string>('');
  const [birthYear, setBirthYear] = React.useState<string>('');
  const [contentError, setContentError] = React.useState<string | null>(null);
  const [birthday, setBirthday] = React.useState<{ month: number; day: number; year: number } | null>(null);

  const handleNext = () => {
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

    // Convert string values to numbers
    const day = parseInt(birthDay, 10);
    const month = parseInt(birthMonth, 10);
    const year = parseInt(birthYear, 10);

    // Check if date is valid
    const date = new Date(year, month - 1, day);
    const isValidDate = (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );

    if (!isValidDate) {
      setContentError('Please enter a valid date of birth');
      return;
    }

    // If date is valid, proceed with sign in
    signIn('demo-token');
  };

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


  const months = [
    {label: 'January', value: 1},
    {label: 'February', value: 2},
    {label: 'March', value: 3},
    {label: 'April', value: 4},
    {label: 'May', value: 5},
    {label: 'June', value: 6},
    {label: 'July', value: 7},
    {label: 'August', value: 8},
    {label: 'September', value: 9},
    {label: 'October', value: 10},
    {label: 'November', value: 11},
    {label: 'December', value: 12},
  ]

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1
  }));

  const currentYear = new Date().getFullYear() - 13;
  const years = Array.from({ length: 110 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: currentYear - i
  }));


  const getBirthdayForSubmission = (): Birthday | undefined => {
    if (!birthday) return undefined;
    return {
      month: birthday.month,
      day: birthday.day,
      year: birthday.year
    };
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
          Let's Create your profile
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
    marginBottom: 16,
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
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
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

});
