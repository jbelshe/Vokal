// src/components/PropertyListCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { theme } from '@/assets/theme';
import { Property } from '@/types/property';
import { ImageWithLoader } from './ImageWithLoader';

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

    const handlePress = React.useCallback(() => {
        onPress(property);
    }, [onPress, property]);

    return (
        <TouchableOpacity
            key={property.id}
            style={styles.listItem}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <FlatList
                // data={property.images || []}
                data={property.image_urls || []}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
                contentContainerStyle={styles.imageScrollContent}
                windowSize={5}
                removeClippedSubviews={true}
                renderItem={({ item: imgKey }) => (
                    <MemoizedImage imgKey={imgKey} />
                    // <ImageWithLoader
                    //     uri={imgKey}
                    //     resizeMode="cover"
                    //     containerStyle={styles.imageContainer}
                    //     imageStyle={styles.propertyImage} />
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
    propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

});

export default PropertyListCard;