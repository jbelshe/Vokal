import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import CloseIcon from '../../assets/icons/close.svg';
import { theme } from '../../assets/theme';
import { useAppContext } from '../../context/AppContext';
import { PurpleButtonLarge } from '@/components/PurpleButtonLarge';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'PropertyDetails'>;

const screenWidth = Dimensions.get('window').width;

export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const { propertyId } = route.params;
  const { properties } = useAppContext();

  const property = properties.find(p => p.id === propertyId);

  // Early return if property is not found
  if (!property) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
        </View>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Location Info</Text>
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <CloseIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Horizontal Image Scroll */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            contentContainerStyle={styles.imageScrollContent}
          >
            {property.images?.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={img.source}
                  style={styles.propertyImage}
                  resizeMode="cover"
                  alt={img.alt}
                />
              </View>
            ))}
          </ScrollView>
          { /* Text Container */}
          <View style={styles.contentContainer}>

            {property?.title && (
              <View style={styles.headerRow}>
                <Text style={[styles.propertyTitle, theme.textStyles.title1]}>
                  {property.title}
                </Text>
              </View>
            )}
            <View style={styles.headerRow}>
              <Image
                source={property?.status === 'vacant'
                  ? require('../../assets/icons/location-purple-icon.png')
                  : require('../../assets/icons/location-blue-icon.png')
                }
                style={styles.statusIcon}
              />
              <Text style={[theme.textStyles.title2]}>
                {property.address_1 + (property.address_2 ? (", #" + property.address_2) : "")}
              </Text>
            </View>

            {property.description && (
              <View style={styles.section}>
                <View style={styles.sectionGroupText}>
                <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                  Description
                </Text>
                <Text style={[styles.sectionText, theme.textStyles.body]}>
                  {property.description}
                </Text>
                </View>
              </View>
            )}

            {property.owners_note && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                  Owner's Note
                </Text>
                <Text style={[styles.sectionText, theme.textStyles.body]}>
                  {property.owners_note}
                </Text>
              </View>
            )}

            {property.estimated_open && (
              <View style={styles.section}>
                <View style={styles.sectionGroupOneLine}>
                  <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                    Estimated Opening: 
                  </Text>
                  <Text style={[styles.sectionText, theme.textStyles.body]}>
                    {property.estimated_open}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
          <View style={styles.buttonContainer}>
            {
              property.status==='vacant' ? 
              <PurpleButtonLarge
              title="Submit Suggestions"
              onPress={() => {}}
              />
              :
              <PurpleButtonLarge
                title="View on Instagram"
                onPress={() => {
                  //Linking.openURL(property.instagram_link);
                }}
              />
            }
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  topBarContainer: {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 16,
    height: 90, 
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50, // Align with paddingTop of container
    textAlign: 'center',
    padding: 15,
    lineHeight: 40, // Match button height
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 50, // Align with paddingTop of container
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11, // Ensure it's above the title
  },
  scrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary_text,
    paddingTop: 8,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 24,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  imageScrollView: {
    marginHorizontal: -16, // Counteract the padding of listItem
    marginBottom: 12,
    paddingLeft: 12,
    marginTop: 20,
  },
  imageScrollContent: {
    paddingHorizontal: 20, // Match listItem padding
    paddingRight: 6, // Extra space on the right for better scrolling
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 12, // Slightly larger border radius
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  statusText: {
    color: theme.colors.secondary_text,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 48,
    zIndex: 10,
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface2,
  },
  sectionTitle: {
    paddingTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary_text,
  },
  sectionText: {
    paddingTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.primary_text,
  },
  sectionGroupText: {
  },
  sectionGroupOneLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary_text,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.secondary_text,
  },
});

