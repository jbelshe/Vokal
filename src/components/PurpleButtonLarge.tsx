import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../assets/theme/colors';
import { textStyles } from '../assets/theme/textStyles';

type PurpleButtonLargeProps = TouchableOpacityProps & {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyleCustom?: TextStyle;
  disabled?: boolean;
};

export const PurpleButtonLarge: React.FC<PurpleButtonLargeProps> = ({
  title,
  onPress,
  style,
  textStyleCustom,
  disabled = false,
  ...rest
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.button, style, disabled && styles.disabled]}
      {...rest}
    >
      <LinearGradient
        colors={[colors.primary_gradient_start, colors.primary_gradient_end]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Text style={[styles.text, textStyleCustom]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '90%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    ...textStyles.button1,
    color: 'white',
    textAlign: 'center',
    
  },
  disabled: {
    opacity: 0.6,
  },
});
