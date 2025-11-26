import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity, ScrollView, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { theme } from '../../assets/theme';
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from 'react-native-element-dropdown';
import { PurpleButtonLarge } from '../../components/PurpleButtonLarge';
import { Profile } from '../../types/profile';
import { Birthday } from '../../types/birthday';

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

// Helper function to extract birthday values from Profile's Birthday type
const parseBirthdayFromProfile = (birthday: Birthday | null | undefined): { month: number | null; day: number | null; year: number | null } => {
  if (!birthday) {
    return { month: null, day: null, year: null };
  }

  // Handle string format "YYYY-MM-DD"
  if (typeof birthday === 'string') {
    const date = new Date(birthday);
    console.log("Date:", date)
    if (!isNaN(date.getTime())) {
      return {
        month: date.getUTCMonth() + 1, // Use UTC methods
        day: date.getUTCDate(),
        year: date.getUTCFullYear()
      };
    }
    return { month: null, day: null, year: null };
  }

  // Handle { isoDate: string } format
  if (typeof birthday === 'object' && 'isoDate' in birthday && birthday.isoDate) {
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
    month: (birthday as any).month || null,
    day: (birthday as any).day || null,
    year: (birthday as any).year || null
  };
};


export default function ProfileScreen({ navigation, route }: Props) {

  const handleBack = () => {
    navigation.goBack();
  };

  const { state, dispatch, updateProfileInDatabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);



  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = ('' + phone).replace(/\D/g, '');
    // Check if we have enough digits to format
    if (cleaned.length < 10) return cleaned;

    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    // For numbers with country code or other formats, return as is
    return phone;
  };


  // Form state
  const [firstName, setFirstName] = useState(state.profile?.firstName || '');
  const [lastName, setLastName] = useState(state.profile?.lastName || '');
  const [selectedGender, setSelectedGender] = useState<string>(state.profile?.gender || '');
  const [email, setEmail] = useState(state.profile?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(state.profile?.phoneNumber || ''));
  const [zipCode, setZipCode] = useState(state.profile?.zipCode || '');
  const [birthDay, setBirthDay] = useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.day;
  });
  const [birthMonth, setBirthMonth] = useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.month;
  });
  const [birthYear, setBirthYear] = useState<number | null>(() => {
    const parsed = parseBirthdayFromProfile(state.profile?.birthday);
    return parsed.year;
  });

  // Sync local state when profile changes
  useEffect(() => {
    if (state.profile) {
      setFirstName(state.profile.firstName || '');
      setLastName(state.profile.lastName || '');
      setEmail(state.profile.email || '');
      setPhoneNumber(formatPhoneNumber(state.profile.phoneNumber || ''));
      setZipCode(state.profile.zipCode || '');
      setSelectedGender(state.profile.gender || '');
      const parsed = parseBirthdayFromProfile(state.profile.birthday);
      setBirthMonth(parsed.month);
      setBirthDay(parsed.day);
      setBirthYear(parsed.year);
    }
  }, [state.profile]);

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
  ];

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


  const handleEditSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      // Toggle to edit mode
    } else {
      // Save mode - validate and save
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter both first and last name');
        return;
      }

      if (zipCode.length !== 5) {
        Alert.alert('Error', 'Please enter a valid 5-digit zip code');
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Check if all birthday fields are filled
      if (!birthDay || !birthMonth || !birthYear) {
        Alert.alert('Error', 'Please enter a complete date of birth');
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
        Alert.alert('Error', 'Please enter a valid date of birth');
        return;
      }

      try {
        const updatedFields: Partial<Profile> = {
          userId: state.profile?.userId,
        }
        if (firstName !== state.profile?.firstName) {
          updatedFields.firstName = firstName || null;
        }
        if (lastName !== state.profile?.lastName) {
          updatedFields.lastName = lastName || null;
        }
        if (email !== state.profile?.email) {
          updatedFields.email = email || null;
        }
        if (zipCode !== state.profile?.zipCode) {
          updatedFields.zipCode = zipCode || null;
        }
        if (selectedGender !== state.profile?.gender) {
          updatedFields.gender = selectedGender || null;
        }
        const currentBirthday = state.profile?.birthday;
        const parsed = parseBirthdayFromProfile(currentBirthday);
        const isBirthdayChanged = parsed.month !== birthMonth || parsed.day !== birthDay || parsed.year !== birthYear;
        if (isBirthdayChanged) {
          updatedFields.birthday = {
            month: birthMonth,
            day: birthDay,
            year: birthYear
          } as const;
        }

        // If no fields were changed, just exit edit mode
        if (Object.keys(updatedFields).length === 0) {
          setIsEditing(false);
          return;
        }
        console.log("Updated Fields:", updatedFields);
        const mergedProfile: Profile = {
          phoneNumber: phoneNumber || null,
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          zipCode: zipCode || null,
          gender: selectedGender || null,
          birthday: {
            month: birthMonth,
            day: birthDay,
            year: birthYear
          } as const,
          emailSubscribed: state.profile?.emailSubscribed || false,
          userId: state.profile?.userId ?? null,
          role: state.profile?.role ?? null 
        } 
        dispatch({ type: "SET_PROFILE", payload: mergedProfile, msg: "ProfileScreen Update" });

        const success = await updateProfileInDatabase(updatedFields);
        if(!success) {
          Alert.alert('Error', 'Failed to save profile. Please try again.');
          return;
        }

        // Show success toast
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      }
      catch (error) {
          console.error('Error updating profile:', error);
          Alert.alert('Error', 'Failed to update profile. Please try again.');
          return;

        };

      }
  };


    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
        <ImageBackground
          source={require('../../assets/images/bg-bottom-gradient.png')}
          style={styles.background}>
          <View style={styles.container}>
            <View style={styles.topBarContainer}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, theme.textStyles.title1]}>Personal Info</Text>
            </View>
            <KeyboardAwareScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.fieldLabel}>First Name*</Text>
              <TextInput
                style={[styles.input, !isEditing ? styles.placeholderInput : styles.filledInput]}
                placeholder="First Name"
                placeholderTextColor={theme.colors.secondary_text}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={isEditing}
              />

              <Text style={styles.fieldLabel}>Last Name*</Text>
              <TextInput
                style={[styles.input, !isEditing ? styles.placeholderInput : styles.filledInput]}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.secondary_text}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={isEditing}
              />

              <Text style={styles.fieldLabel}>Gender*</Text>
              <Dropdown
                style={[styles.dropdown, !isEditing && styles.disabledDropdown]}
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
                disable={!isEditing}
              />

              <Text style={styles.fieldLabel}>Date of Birth*</Text>
              <View style={styles.dateContainer}>
                {/* TODO: Figure out why values are snapping back */}
                <View style={[styles.dateInput, { flex: 2.1 }]}>
                  <Dropdown
                    style={[styles.dropdown, !isEditing && styles.disabledDropdown]}
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
                    disable={!isEditing}
                  />
                </View>
                <View style={[styles.dateInput, { marginHorizontal: 5, flex: 1.2 }]}>
                  <Dropdown
                    style={[styles.dropdown, !isEditing && styles.disabledDropdown]}
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
                    disable={!isEditing}
                  />
                </View>
                <View style={[styles.dateInput, { flex: 1.5 }]}>
                  <Dropdown
                    style={[styles.dropdown, !isEditing && styles.disabledDropdown]}
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
                    disable={!isEditing}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Email*</Text>
              <TextInput
                style={[styles.input, !isEditing ? styles.placeholderInput : styles.filledInput]}
                placeholder="Email Address"
                placeholderTextColor={theme.colors.secondary_text}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={isEditing}
              />

              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={[styles.input, styles.placeholderInput]}
                placeholder="Mobile Number"
                placeholderTextColor={theme.colors.secondary_text}
                value={phoneNumber}
                editable={false}
              />

              <Text style={styles.fieldLabel}>Zip Code*</Text>
              <TextInput
                style={[styles.input, !isEditing ? styles.placeholderInput : styles.filledInput]}
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
                editable={isEditing}
              />

              <View style={styles.buttonWrapper}>
                <PurpleButtonLarge
                  title={isEditing ? "Save" : "Edit"}
                  onPress={handleEditSave}
                />
              </View>
            </KeyboardAwareScrollView>
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    fieldLabel: {
      ...theme.textStyles.body,
      color: theme.colors.primary_text,
      marginBottom: 2,
      marginTop: 6,
      paddingLeft: 6,
      fontSize: 14,
      fontWeight: '500',
    },
    input: {
      width: '100%',
      height: 50,
      backgroundColor: theme.colors.surface1,
      borderRadius: 12,
      paddingHorizontal: 20,
      fontSize: 16,
      marginBottom: 2,
    },
    dropdown: {
      width: '100%',
      height: 50,  // Match input height
      backgroundColor: theme.colors.surface1,
      borderRadius: 12,
      paddingHorizontal: 20,  // Match input padding
      marginBottom: 2,  // Match input margin
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.surface2,  // Add subtle border for better definition
    },
    disabledDropdown: {
      opacity: 0.6,
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
      paddingHorizontal: 8,
      borderRadius: 12
    },
    placeholderStyle: {
      fontSize: 16,
      color: theme.colors.secondary_text,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: theme.colors.primary_text,
    },
    dateContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 4,
    },
    dateInput: {
      flex: 1,
      height: 56,
      justifyContent: 'center',
    },
    buttonWrapper: {
      marginTop: 24,
      marginBottom: 20,
      alignItems: 'center',
    },
    background: {
      flex: 1,
      resizeMode: 'cover',
      width: '100%',
      height: '100%',
    },
    placeholderInput: {
      color: theme.colors.secondary_text,
    },
    filledInput: {
      color: theme.colors.primary_text,
    },
    topBarContainer: {
      paddingTop: Platform.OS === 'android' ? 20 : 50,
      paddingBottom: 4,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 11,
    },
    headerTitle: {
      ...theme.textStyles.title1,
      flex: 1,
      textAlign: 'center',
      left: -20,
    },
    editButton: {
      padding: 8,
    },

    editButtonText: {
      ...theme.textStyles.button1,
      color: theme.colors.primary_text,
      fontSize: 16,
    }
  });