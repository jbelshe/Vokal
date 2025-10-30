// src/components/buttons/RoundButton.tsx
import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Logo from '../assets/icons/chevron-right.svg';

import { StyleSheet } from 'react-native';
import { theme } from '../assets/theme';

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
    <Logo width={40} height={40} fill="white" />
  </TouchableOpacity>
);



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