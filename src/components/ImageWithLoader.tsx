import React, { useState, memo, useCallback } from "react";
import { View, Image, ActivityIndicator, StyleSheet, StyleProp, ImageStyle, ViewStyle } from "react-native";

interface ImageWithLoaderProps {
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

// Global cache to track loaded images across remounts
const loadedImagesCache = new Set<string>();

// In ImageWithLoader.tsx
const ImageWithLoaderComponent : React.FC<ImageWithLoaderProps> = memo(({ 
  uri, 
  resizeMode = 'cover', 
  imageStyle, 
  containerStyle 
}) => {
  // Check if image was already loaded before
  const wasLoaded = loadedImagesCache.has(uri);
  const [loading, setLoading] = useState(!wasLoaded);

  // // Debug logging
  // React.useEffect(() => {
  //   if (wasLoaded) {
  //     console.log(`[ImageWithLoader] Image already in cache: ${uri.substring(0, 50)}...`);
  //   } else {
  //     console.log(`[ImageWithLoader] Loading new image: ${uri.substring(0, 50)}...`);
  //   }
  // }, [uri, wasLoaded]);

  const handleLoadEnd = useCallback(() => {
    // console.log(`[ImageWithLoader] Image loaded: ${uri.substring(0, 50)}...`);
    setLoading(false);
    loadedImagesCache.add(uri);
  }, [uri]);

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri }}
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
