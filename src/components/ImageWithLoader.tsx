import React, { useState, memo, useCallback } from "react";
import { View, Image, ActivityIndicator, StyleSheet, StyleProp, ImageStyle, ViewStyle } from "react-native";

type Props = {
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

// In ImageWithLoader.tsx
const ImageWithLoaderComponent = React.memo(({ 
  uri, 
  resizeMode = 'cover', 
  imageStyle, 
  containerStyle 
}: Props) => {
  const [loading, setLoading] = useState(true);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

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
