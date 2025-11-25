import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import MapView, { Marker, Region, Callout } from 'react-native-maps';
import { fetchPropertiesInBounds, Property } from '../api/properties';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../assets/theme';
import MapIcon from '../assets/icons/map-icon.svg';
import ListIcon from '../assets/icons/list-icon.svg';
import AccountIcon from '../assets/icons/account-icon.svg';
import { Image } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { fetchCoverImage } from '../api/images';
import { getImageURL } from '../api/images';
import { ImageWithLoader } from '../components/ImageWithLoader';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {

  React.useLayoutEffect(() => {
    navigation.setOptions({
      animation: 'slide_from_right',
      animationTypeForReplace: 'pop',
    });
  }, [navigation]);

  const { currentPropertyId, setCurrentPropertyId } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const { properties, setProperties, mapRegion, setMapRegion } = useAppContext();
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<MapView>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRegionRef = useRef<Region | null>(null);

  const screenWidth = Dimensions.get('window').width;

  /**
   * Calculates the bounding box for the visible map region plus a buffer
   * to include neighboring off-screen locations.
   */
  const calculateBounds = useCallback((region: Region, bufferMultiplier: number = 0.5): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } => {
    // Calculate the center and deltas
    const centerLat = region.latitude;
    const centerLng = region.longitude;
    const latDelta = region.latitudeDelta;
    const lngDelta = region.longitudeDelta;

    // Add buffer to the deltas (bufferMultiplier of 0.5 means 50% extra on each side)
    const bufferedLatDelta = latDelta * (1 + bufferMultiplier * 2);
    const bufferedLngDelta = lngDelta * (1 + bufferMultiplier * 2);

    return {
      minLat: centerLat - bufferedLatDelta / 2,
      maxLat: centerLat + bufferedLatDelta / 2,
      minLng: centerLng - bufferedLngDelta / 2,
      maxLng: centerLng + bufferedLngDelta / 2,
    };
  }, []);

  /**
   * Loads properties for the visible map region plus buffer.
   */
  const loadPropertiesForRegion = useCallback(async (region: Region) => {
    try {
      setLoadingProperties(true);
      setError(null);

      // Calculate bounds with 50% buffer to include neighboring off-screen locations
      const bounds = calculateBounds(region, 0.5);
      const data = await fetchPropertiesInBounds(bounds);
      setProperties(data);
      setMapRegion(region);
      console.log("Properties loaded for region1:", data.length);
    } catch (err) {
      console.error('Error loading properties for region:', err);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoadingProperties(false);
      console.log("Properties loaded for region2:", properties.length);
    }
  }, [calculateBounds]);

  const lastPressTimeRef = useRef<number>(0);
  const handleMarkerPress = async(property: Property) => {
    const now = Date.now();
    if (now - lastPressTimeRef.current < 300) {
      return; // ignore very fast repeat presses
    }
    lastPressTimeRef.current = now;
    console.log("marker press, selected property:", {
      id: property.id,
      title: property.address_1 + ' ' + property.address_2,
    });
    setSelectedProperty(prev => prev?.id === property.id ? null : property);
  };


  const handleCalloutPress = (property: Property) => {
    console.log("Callout Press, Selected property:", {
      id: property.id,
      title: property.address_1 + ' ' + property.address_2,
    });
    setCurrentPropertyId(property.id);
    navigation.navigate('PropertyDetails', { propertyId: property.id });
  };


  const handleRegionChangeComplete = useCallback((region: Region) => {
    // If we have a previous region, only refetch if movement is significant
    if (lastRegionRef.current) {
      const prev = lastRegionRef.current;
      const latDiff = Math.abs(prev.latitude - region.latitude);
      const lngDiff = Math.abs(prev.longitude - region.longitude);

      // tweak these thresholds as needed
      const MIN_MOVE = 0.0005;

      if (latDiff < MIN_MOVE && lngDiff < MIN_MOVE) {
        lastRegionRef.current = region;
        return; // ignore tiny region change (like callout/marker selection)
      }
    }

    lastRegionRef.current = region;

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      loadPropertiesForRegion(region);
    }, 300);
  }, [loadPropertiesForRegion]);


  // /**
  //  * Handles map region changes with debouncing to avoid too many API calls.
  //  */
  // const handleRegionChangeComplete = useCallback((region: Region) => {
  //   // Store the last region for retry functionality
  //   lastRegionRef.current = region;

  //   // Clear any pending timeout
  //   if (loadingTimeoutRef.current) {
  //     clearTimeout(loadingTimeoutRef.current);
  //   }

  //   // Debounce the API call to avoid excessive requests while user is panning
  //   loadingTimeoutRef.current = setTimeout(() => {
  //     loadPropertiesForRegion(region);
  //   }, 300); // 300ms debounce
  // }, [loadPropertiesForRegion]);

  /**
   * Initial load when map is ready - triggers load for initial region.
   */
  const handleMapReady = useCallback(() => {
    // Trigger initial load with the initial region
    const initialRegion: Region = {
      latitude: 34.0529855,
      longitude: -118.4705272,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    lastRegionRef.current = initialRegion;
    loadPropertiesForRegion(initialRegion);
    console.log("Initial region loaded", initialRegion);
  }, [loadPropertiesForRegion]);

  /**
   * Retry loading properties after an error.
   */
  const handleRetry = useCallback(() => {
    // Use the last known region, or fallback to initial region
    const regionToUse = lastRegionRef.current || {
      latitude: 34.0529855,
      longitude: -118.4705272,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    loadPropertiesForRegion(regionToUse);
  }, [loadPropertiesForRegion]);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.headerContainer}>
          <View style={[styles.locationRuleContainer, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../assets/icons/location-purple-icon.png')} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={theme.textStyles.caption}>Vacant Spaces</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../assets/icons/location-blue-icon.png')} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={theme.textStyles.caption}>Opening Soon</Text>
            </View>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.secondary_text} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Ionicons
                name="close-circle"
                size={20}
                color="#666"
                style={styles.clearIcon}
                onPress={() => setSearchQuery('')}
              />
            )}
            <AccountIcon
              width={25}
              height={25}
              fill={theme.colors.secondary_text}
              style={styles.accountIcon}
              onPress={() => navigation.navigate('SettingsMain')}
            />
          </View>
        </View>
        {/* View Mode Selector */}
        <View style={[styles.viewModeSelector]}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            {viewMode === 'map' ? (
              <LinearGradient
                colors={[theme.colors.primary_gradient_start, theme.colors.primary_gradient_end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.viewModeButtonGradient}
              >
                <MapIcon width={20} height={20} fill="#fff" />
                <Text style={styles.viewModeButtonTextSelected}>Map</Text>
              </LinearGradient>
            ) : (
              <View style={styles.viewModeButtonUnselected}>
                <MapIcon width={20} height={20} fill={theme.colors.primary_text} />
                <Text style={styles.viewModeButtonTextUnselected}>Map</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            {viewMode === 'list' ? (
              <LinearGradient
                colors={[theme.colors.primary_gradient_start, theme.colors.primary_gradient_end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.viewModeButtonGradient}
              >
                <ListIcon width={20} height={20} fill="#fff" />
                <Text style={styles.viewModeButtonTextSelected}>List</Text>
              </LinearGradient>
            ) : (
              <View style={styles.viewModeButtonUnselected}>
                <ListIcon width={20} height={20} fill={theme.colors.primary_text} />
                <Text style={styles.viewModeButtonTextUnselected}>List</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>

      {viewMode === 'map' ? (
        <>
          {loadingProperties && properties.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6247AA" />
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : error && properties.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EB4335" />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText} onPress={handleRetry}>
                Tap to retry
              </Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: 34.0529855,
                longitude: -118.4705272,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              showsMyLocationButton
              onRegionChangeComplete={handleRegionChangeComplete}
              onMapReady={handleMapReady}
            >
              {properties.map((property) => (
                <Marker
                  key={property.id}
                  coordinate={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                  }}
                  title={property.address_1}
                  onPress={() => handleMarkerPress(property)}
                  pointerEvents="auto"
                >
                  <Image
                    source={property.status === 'vacant' ?
                      require('../assets/icons/location-purple-icon.png')
                      :
                      require('../assets/icons/location-blue-icon.png')
                    }
                    style={{ width: 40, height: 40 }}
                  />
                  <Callout tooltip={false} style={styles.calloutContainer} onPress={() => {handleCalloutPress(property)}}>
                    <View style={styles.calloutContent}>
                      <View style={styles.markerImageContainer}>
                        {property.cover_image_path ? (
                          <Image
                            source={{ uri: property.cover_image_url }}
                            style={styles.propertyImage}
                          />
                        ) : (
                          <View style={[styles.markerImageContainer, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text>No Image</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.calloutTextContainer}>
                        <Text style={[styles.propertyTitle, theme.textStyles.title2]} numberOfLines={1}>
                          {property.title || 'Property'}
                        </Text>
                        <Text style={[styles.propertyAddress, theme.textStyles.title2]} numberOfLines={2}>
                          {property.address_1}
                          {property.address_2 ? `, ${property.address_2}` : ''}
                        </Text>
                        <Text style={styles.propertyStatus}>
                          {property.status === 'vacant' ? 'Vacant' : 'Opening Soon'}
                        </Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          )}
        </>
      ) : (
        <View style={styles.listContainer}>
          {loadingProperties && properties.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6247AA" />
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : error && properties.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EB4335" />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText} onPress={handleRetry}>
                Tap to retry
              </Text>
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={48} color={theme.colors.secondary_text} />
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          ) : (
            <ScrollView style={styles.listScrollView} contentContainerStyle={styles.listContent}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.listItem}
                  onPress={() => handleCalloutPress(property)}
                  activeOpacity={0.7}
                >
                  <FlatList
                    // data={property.images || []}
                    data = { property.image_urls || [] }
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    initialNumToRender={3}
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}
                    contentContainerStyle={styles.imageScrollContent}
                    renderItem={({ item: imgKey }) => (
                      // <View style={styles.imageContainer}>
                      <ImageWithLoader uri={imgKey} resizeMode="cover" containerStyle={styles.imageContainer} imageStyle={styles.propertyImage}/>
                        // { <Image
                          // source={imgKey.source}
                          // source={{ uri: imgKey }}
                          // style={styles.propertyImage}
                          // resizeMode="cover"
                          // alt={imgKey.alt}
                        // /> */}
                      // </View>
                    )}
                  />
                  <View style={styles.listItemContent}>
                    <Image
                      source={property.status === 'vacant' ?
                        require('../assets/icons/location-purple-icon.png')
                        :
                        require('../assets/icons/location-blue-icon.png')
                      }
                      style={{ width: 20, height: 20, marginTop: 2 }}
                    />
                    <View style={styles.listItemTextContainer}>
                      <Text style={[styles.listItemAddress, theme.textStyles.body]}>
                        {property.address_1 + (property.address_2 ? ', #' + property.address_2 : '') || 'Property'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface1,
  },
  topContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    left: 15,
    right: 15,
    zIndex: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
    marginBottom: 12, // Add space between header and view mode selector
  },
  locationRuleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    width: '100%',
    alignSelf: 'center',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255)',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
  },
  accountIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    width: 240,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000, // Ensure it appears above other elements
  },
  calloutContent: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
  },
  markerImageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  calloutTextContainer: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary_text,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: theme.colors.secondary_text,
    marginBottom: 4,
  },
  propertyStatus: {
    fontSize: 12,
    color: theme.colors.primary_text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6247AA',
    textDecorationLine: 'underline',
  },
  loadingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 140 : 170,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewModeButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  viewModeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  viewModeButtonUnselected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: 'transparent',
  },
  viewModeButtonTextSelected: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewModeButtonTextUnselected: {
    color: theme.colors.primary_text,
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    marginTop: 240, // Space for the top container and view mode selector
   // backgroundColor: theme,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listItemTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  listItemAddress: {
    marginBottom: 4,
  },
  imageScrollView: {
    marginHorizontal: -16, // Counteract the padding of listItem
    marginTop: 4,
    marginBottom: 4,
  },
  imageScrollContent: {
    paddingHorizontal: 16, // Match listItem padding
    paddingBottom: 16,
    paddingTop: 8,
    paddingRight: 4, // Extra space on the right for better scrolling
  },
  imageContainer: {
    width: 150, 
    height: 150, 
    borderRadius: 12, // Slightly larger border radius
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.secondary_text,
  },

});
