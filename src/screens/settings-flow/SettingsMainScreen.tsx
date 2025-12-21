import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import { useAuth } from '../../context/AuthContext';
import { PurpleButtonLarge } from '../../components/PurpleButtonLarge';
import { SectionOptionsButton } from '../../components/SectionOptionsButton';
import { ProfileIconButton } from '../../components/ProfileIconButton';
import { LinearGradient } from 'expo-linear-gradient';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import VotedIcon from '../../assets/icons/home.png';
import ProfileIcon from '../../assets/icons/profile-silhouette.png';
import RemindersIcon from '../../assets/icons/alert.png';
import ContactIcon from '../../assets/icons/telephone.png';
import { Profile } from '@/types/profile';
import { useNotificationSettingsWatcher } from '@/hooks/useNotificationSettingsWatcher';
import { ensureNotificationsRegistered } from '@/lib/notifications';


// Import the icon images
const Icons = {
  voted: VotedIcon,
  profile: ProfileIcon,
  reminders: RemindersIcon,
  contact: ContactIcon,
};

type Props = NativeStackScreenProps<AppStackParamList, 'SettingsMain'>;

export default function SettingsHomeScreen({ navigation, route }: Props) {
  const { state, dispatch, signOut, updateProfileInDatabase } = useAuth();
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>((!!state.profile?.expoPushToken && state.profile?.notificationsEnabled) || false);

  const { openNotificationSettings } = useNotificationSettingsWatcher(state.profile?.userId!, {
    onTokenUpdated: (token) => {
      const payload : Partial<Profile> = { expoPushToken: token };
      dispatch({ type: 'SET_PROFILE', payload, msg: 'Notification Listener token updated' });
    }
  });

  const handleBack = () => {
    navigation.goBack(); //('Home');
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleProfileImagePress = () => {
    console.log("TODO: Handle Profile image pressed")
  };

  const handleNotificationToggle = async (value: boolean, source: string) => {
    if (! state.profile?.expoPushToken ) {
      Alert.alert(
          "Notifications Disabled",
          "Please enable notifications in your device settings to get alerts.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                openNotificationSettings();
              },
            },
          ]
        );
      console.log("Exiting setup");
      // return;
    }

    // const token = await ensureNotificationsRegistered(state.profile.userId!);
    console.log("Notification toggle:", value, "from:", source);
    updateProfileInDatabase({ notificationsEnabled: value });
    console.log("NotificationsEnabled:", value, remindersEnabled)
    if (value) {
      if (state.profile?.expoPushToken) {
        Alert.alert("Notifications Enabled", "You will now receive reminder notifications.");
      }

    }

    setRemindersEnabled(value);
  };

  const getUserName = () => {
    console.log("Profile: ", state.profile);
    if (state.profile?.firstName && state.profile?.lastName) {
      return `${state.profile.firstName} ${state.profile.lastName}`;
    }
    if (state.profile?.firstName) {
      
      return state.profile.firstName;
    }
    return 'User';
  };

  const getUserInitials = () => {
    const firstName = state.profile?.firstName || '';
    const lastName = state.profile?.lastName || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    if (firstInitial) {
      return firstInitial;
    }
    return 'U'; // Default to 'U' for User if no name available
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

        {/* Profile Image */}
        <View style={styles.imageContainer}>
            <LinearGradient
              colors={[theme.colors.primary_gradient_start, theme.colors.primary_gradient_end]}
              style={styles.profileImageContainer}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
                    <Text style={styles.profileInitials}>{getUserInitials()}</Text>
            </LinearGradient>
        </View>

        {/* User Name */}
        <Text style={[styles.userName, theme.textStyles.title1]}>
          {getUserName()}
        </Text>

        {/* Profile Buttons */}
        <View style={styles.buttonsContainer}>
          <SectionOptionsButton
            title="Voted Properties"
            subtext="All your votes in one place"
            image={Icons.voted}
            icon={
              <ProfileIconButton onPress={() => {navigation.navigate('VoteHistory')}}>
                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
              </ProfileIconButton>
            }
            onPress={() => {
              navigation.navigate('VoteHistory');
            }}
          />

          <SectionOptionsButton
            title="Personal Info"
            subtext="View or update personal information"
            image={Icons.profile}
            icon={
              <ProfileIconButton onPress={() => {navigation.navigate('Profile')}}>
                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
              </ProfileIconButton>
            }
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />

          { /* TODO:  Determine how we want to do notifications */}
          <SectionOptionsButton
            title="Reminders"
            subtext="First to know when spaces become vacant, are occupied, and when they open"
            image={Icons.reminders}
            toggle={{
              value: remindersEnabled,
              onValueChange: (value) => {handleNotificationToggle(value, "toggle")}
            }}
            onPress={() => handleNotificationToggle(!remindersEnabled, "press") }
          />

          <SectionOptionsButton
            title="Contact Us"
            subtext="To provide feedback, contact support, or partner with us"
            image={Icons.contact}
            icon={
              <ProfileIconButton onPress={() => {navigation.navigate('ContactUs')}}>
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
    left: -5,
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
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary_gradient_start,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 48,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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

