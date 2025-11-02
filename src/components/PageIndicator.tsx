import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../assets/theme/colors';

type PageIndicatorProps = {
  totalPages: number;
  currentPage: number;
  activeColor?: string;
  inactiveColor?: string;
  dotSize?: number;
  dotSpacing?: number;
};

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  totalPages,
  currentPage,
  activeColor = colors.primary_gradient_start,
  inactiveColor = colors.primary_gradient_end,
  dotSize = 10,
  dotSpacing = 10, 
}) => {
  return (
    <View style={styles.container}>
      {[...Array(totalPages)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: index === currentPage ? dotSize * 3 : dotSize, // Active dot is 2.5x wider
              height: dotSize,
              borderRadius: dotSize / 2,
              marginHorizontal: dotSpacing / 2,
              backgroundColor: index === currentPage ? activeColor : inactiveColor,
              opacity: index === currentPage ? 1 : 0.6, // Slightly transparent inactive dots
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    // Styling is applied inline for dynamic values
  },
});
