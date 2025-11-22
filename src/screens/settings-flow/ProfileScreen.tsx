import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { theme } from '../../assets/theme';
import React, { useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation, route }: Props) {
  
    const handleBack = () => {
        navigation.goBack();
    };

  const { state } = useAuth();


  return (
      <ImageBackground
        source={require('../../assets/images/bg-bottom-gradient.png')}
        style={styles.background}>
        <View style={styles.container}>
          <View style={styles.topBarContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, theme.textStyles.title1]}>Profile</Text>
          </View>
          
          <ScrollView style={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>{state.profile?.userId || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>First Name:</Text>
                <Text style={styles.value}>{state.profile?.firstName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Last Name:</Text>
                <Text style={styles.value}>{state.profile?.lastName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{state.profile?.email || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{state.profile?.phoneNumber || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Zip Code:</Text>
                <Text style={styles.value}>{state.profile?.zipCode || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{state.profile?.gender || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email Subscribed:</Text>
                <Text style={styles.value}>{state.profile?.emailSubscribed ? 'Yes' : 'No'}</Text>
              </View>
            </View>

            {state.session && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Session Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Access Token:</Text>
                  <Text style={[styles.value, styles.smallText]} numberOfLines={1} ellipsizeMode="tail">
                    {state.session.access_token ? `${state.session.access_token.substring(0, 15)}...` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Expires At:</Text>
                  <Text style={styles.value}>
                    {state.session.expires_at ? new Date(state.session.expires_at * 1000).toLocaleString() : 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </ImageBackground>
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
    padding: 16,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...theme.textStyles.title2,
    color: theme.colors.primary_text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  label: {
    ...theme.textStyles.body,
    color: theme.colors.primary_text,
    opacity: 0.8,
    marginRight: 8,
  },
  value: {
    ...theme.textStyles.body,
    color: theme.colors.primary_text,
    flexShrink: 1,
    textAlign: 'right',
    flex: 1,
  },
  smallText: {
    fontSize: 12,
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
});