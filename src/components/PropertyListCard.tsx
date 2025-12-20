// src/components/PropertyListCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Pressable } from 'react-native';
import { theme } from '@/assets/theme';
import { Property } from '@/types/property';
import { ImageWithLoader } from './ImageWithLoader';
import { convertImagePath } from '@/lib/imageHelper';
import { ImageSize } from '@/types/imageSizes';


interface PropertyListCardProps {
    property: Property;
    onPress: (property: Property) => void;
}

const MemoizedImage = React.memo(({ imgKey }: { imgKey: string }) => (
    <ImageWithLoader
        uri={imgKey}
        resizeMode="cover"
        containerStyle={styles.imageContainer}
        imageStyle={styles.propertyImage}
    />
), (prevProps, nextProps) => prevProps.imgKey === nextProps.imgKey);


const PropertyListCard = React.memo(({ property, onPress }: PropertyListCardProps) => {
    // // Debug logging
    // React.useEffect(() => {
    //     console.log(`[PropertyListCard] Rendered/Mounted for property: ${property.id}`);
    //     return () => {
    //         console.log(`[PropertyListCard] Unmounted for property: ${property.id}`);
    //     };
    // }, [property.id]);

    
    const [isDraggingImages, setIsDraggingImages] = useState(false);

    const isDraggingImagesRef = React.useRef(false);

    const handlePress = React.useCallback(() => {
      if (!isDraggingImagesRef.current) {
        onPress(property);
      }
    }, [onPress, property]);


    return (
        <TouchableOpacity
            key={property.id}
            style={styles.listItem}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {property.image_urls && property.image_urls.length > 0 && (
              <View style={styles.imageScrollContainer}>
                <MemoizedImage imgKey={convertImagePath(property.image_urls[0], ImageSize.SIZE_512)} />
                {property.image_urls.length > 1 && <MemoizedImage imgKey={convertImagePath(property.image_urls[1], ImageSize.SIZE_512)} />}
              </View>
            )}

            {/* <FlatList
                data={property.image_urls || []}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                windowSize={1}
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
                contentContainerStyle={styles.imageScrollContent}
                renderItem={({ item: imgKey }) => (
                    <View style={styles.imageItemContainer}>
                      <MemoizedImage imgKey={convertImagePath(imgKey, ImageSize.SIZE_512)} />
                    </View>
                )}
            /> */}
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
            {/* </View> */}
        </TouchableOpacity>
    )}, (prevProps, nextProps) => {
    // Only re-render if property or onPress changes
    return prevProps.property.id === nextProps.property.id && 
           prevProps.property.image_urls === nextProps.property.image_urls &&
           prevProps.onPress === nextProps.onPress;
});

const styles = StyleSheet.create({
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
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: -6, // Remove negative margin to prevent horizontal overflow
  },
  imageScrollContent: {
    paddingHorizontal: 12, 
    paddingBottom: 8,
    paddingTop: 8,
    paddingRight: 4,
  },
  imageScrollContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
    marginLeft: 12
  },
  imageItemContainer: {
    marginRight: 4, 
  },
  imageContainer: {
    width: 150, 
    height: 150, 
    borderRadius: 12, // Slightly larger border radius
    overflow: 'hidden',
    backgroundColor: theme.colors.surface2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }, 
    propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

});

export default PropertyListCard;