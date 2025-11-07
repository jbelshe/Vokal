import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import { useAuth } from '../../context/AuthContext';
import { PurpleButtonLarge } from '../../components/PurpleButtonLarge';
import { ProfileSectionButton } from '../../components/ProfileSectionButton';
import { ProfileIconButton } from '../../components/ProfileIconButton';

import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';

// Import the icon images
const Icons = {
  voted: require('../../assets/icons/home.png'),
  profile: require('../../assets/icons/profile-silhouette.png'),
  reminders: require('../../assets/icons/alert.png'),
  contact: require('../../assets/icons/telephone.png'),
};

type Props = NativeStackScreenProps<AppStackParamList, 'SettingsMain'>;

export default function SettingsHomeScreen({ navigation, route }: Props) {
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const { profile, signOut } = useAuth();

  const handleBack = () => {
    navigation.goBack(); //('Home');
  };

  const handleLogout = async () => {
    await signOut();
    // navigation.navigate('Home');
  };

  const handleProfileImagePress = () => {
    console.log("TODO: Handle Profile image pressed")
  };

  const getUserName = () => {
    console.log("Profile: ", profile);
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) {
      
      return profile.firstName;
    }
    return 'User';
  };

  return (
    <ImageBackground
                source={require('../../assets/images/bg-bottom-gradient.png')}
                style={styles.background}>
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBarContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Profile</Text>
      </View>

      {/* <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      > */}
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => {handleProfileImagePress()}}> 
            <Image
              source={require('../../assets/icons/profile-empty.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* User Name */}
        <Text style={[styles.userName, theme.textStyles.title1]}>
          {getUserName()}
        </Text>

        {/* Profile Buttons */}
        <View style={styles.buttonsContainer}>
          <ProfileSectionButton
            title="Voted Properties"
            subtext="All your votes in one place"
            image={Icons.voted}
            icon={
              <ProfileIconButton onPress={() => {}}>
                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
              </ProfileIconButton>
            }
            onPress={() => {
              navigation.navigate('VoteHistory');
            }}
          />

          <ProfileSectionButton
            title="Personal Info"
            subtext="View or update personal information"
            image={Icons.profile}
            icon={
              <ProfileIconButton onPress={() => {}}>
                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
              </ProfileIconButton>
            }
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />

          <ProfileSectionButton
            title="Reminders"
            subtext="First to know when spaces become vacant, are occupied, and when they open"
            image={Icons.reminders}
            toggle={{
              value: remindersEnabled,
              onValueChange: (value) => {
                setRemindersEnabled(value);
              }
            }}
            onPress={() => {
              setRemindersEnabled(!remindersEnabled);
            }}
          />

          <ProfileSectionButton
            title="Contact Us"
            subtext="To provide feedback, contact support, or partner with us"
            image={Icons.contact}
            icon={
              <ProfileIconButton onPress={() => {}}>
                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
              </ProfileIconButton>
            }
            onPress={() => {navigation.navigate('ContactUs')}}
          />  
        </View>
      {/* </ScrollView> */}

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <PurpleButtonLarge
          title="Log Out"
          onPress={handleLogout}
        />
      </View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%', 
  },  
  topBarContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    position: 'relative',
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
    position: 'absolute',
    left: 0,
    top: 60,
    right: 0,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
  },
  userName: {
    textAlign: 'center',
    color: theme.colors.primary_text,
    marginBottom: 32,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
  },
  logoutContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    paddingTop: 16
  },
});

