import React, { useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet, StyleProp, ImageStyle, ViewStyle } from "react-native";

type Props = {
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ImageWithLoader({ uri, resizeMode, imageStyle, containerStyle}: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri }}
        style={[{ width: "100%", height: "100%" }, imageStyle]}
        resizeMode={resizeMode}
        // onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
