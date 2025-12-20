import React, { useState, memo, useCallback } from "react";
import { View, Image, ActivityIndicator, StyleSheet, StyleProp, ImageStyle, ViewStyle } from "react-native";
import { ImageSize } from "../types/imageSizes";
import { convertImagePath } from "../lib/imageHelper";

interface ImageWithLoaderProps {
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  imageStyle?: StyleProp<ImageStyle>;
  imageSize?: ImageSize;
  containerStyle?: StyleProp<ViewStyle>;
};

// Global cache to track loaded images across remounts
const loadedImagesCache = new Set<string>();

// In ImageWithLoader.tsx
const ImageWithLoaderComponent : React.FC<ImageWithLoaderProps> = memo(({ 
  uri, 
  resizeMode = 'cover', 
  imageStyle, 
  imageSize = ImageSize.SIZE_ORIGINAL,
  containerStyle 
}) => {
  // Early return if URI is empty or invalid
  if (!uri || uri.trim() === '') {
    return null;
  }

  const sizedUri = imageSize === ImageSize.SIZE_ORIGINAL ? uri : convertImagePath(uri, imageSize) 
  // Check if image was already loaded before
  const wasLoaded = loadedImagesCache.has(sizedUri);
  const [loading, setLoading] = useState(!wasLoaded);

  // // Debug logging
  // React.useEffect(() => {
  //   if (uri == "https://wjhnxvtqvehvhvhlwosk.supabase.co/storage/v1/object/public/properties_bucket/property_images/d12ccf43-8dc6-41b3-94b9-4ea132fbdfec/17921d30-d03f-4881-8ef8-b4b4987ab84a/original.jpeg") {
  //     console.log("wasLoaded", wasLoaded, "Sized Uri", sizedUri);
  //     if (wasLoaded) {
  //       console.log(`[ImageWithLoader] Image already in cache: ${uri}`);
  //     } else {
  //       console.log(`[ImageWithLoader] Loading new image: ${uri}`);
  //     }
  //   }
  // }, [uri, wasLoaded]);

  const handleLoadEnd = useCallback(() => {
    // console.log(`[ImageWithLoader] Image loaded: ${uri.substring(0, 50)}...`);
    setLoading(false);
    loadedImagesCache.add(sizedUri);
  }, [uri]);

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri : sizedUri, cache: 'force-cache' }}
        style={[{ width: "100%", height: "100%" }, imageStyle]}
        resizeMode={resizeMode}
        onLoadEnd={handleLoadEnd}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the uri changes
  return prevProps.uri === nextProps.uri;
});

export { ImageWithLoaderComponent as ImageWithLoader };

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
