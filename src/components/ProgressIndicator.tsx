// src/components/ProgressIndicator.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../assets/theme/colors';

type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
  activeColor?: string;
  inactiveColor?: string;
  height?: number;
  spacing?: number;
  borderRadius?: number;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  activeColor = colors.primary_gradient_start,
  inactiveColor = colors.primary_gradient_end,
  height = 6,
  spacing = 6,
  borderRadius = 3,
}) => {
  return (
    <View style={[styles.container, { height, borderRadius }]}>
      {[...Array(totalSteps)].map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <View
            key={index}
            style={[
              {
                flex: 1, //isActive ? 2 : 1, // Active step is wider
                height: '100%',
                backgroundColor: activeColor, //isActive || isCompleted ? activeColor : inactiveColor,
                opacity: isActive ? 1 : 0.3,
                marginRight: index === totalSteps - 1 ? 0 : spacing,
                borderRadius,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});