// src/components/buttons/RoundButton.tsx
import React from 'react';
import { TouchableOpacity, Image, StyleProp, ViewStyle } from 'react-native';

interface RoundButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const RoundNextButton: React.FC<RoundButtonProps> = ({ 
  onPress, 
  disabled = false, 
  style 
}) => (
  <TouchableOpacity
    style={[
      styles.nextRoundButton,
      disabled && styles.nextRoundButtonDisabled,
      style
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Image 
      //source={require('../../assets/icons/chevron-right.svg')} 
      style={{ width: 24, height: 24, tintColor: 'white' }}
    />
  </TouchableOpacity>
);


import { StyleSheet } from 'react-native';
import { theme } from '../assets/theme';

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  nextRoundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary_gradient_start,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextRoundButtonDisabled: {
    backgroundColor: theme.colors.primary_gradient_start,
    opacity: 0.6,
  },
});