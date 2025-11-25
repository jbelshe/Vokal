import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../assets/theme/colors';
import { textStyles } from '../assets/theme/textStyles';
import { theme } from '../assets/theme';

type CloseButtonLargeProps = TouchableOpacityProps & {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyleCustom?: TextStyle;
};

export const CloseButtonLarge: React.FC<CloseButtonLargeProps> = ({
  title,
  onPress,
  style,
  textStyleCustom,  
  ...rest
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, style]}
      {...rest}
    >
        <Text style={[styles.text, textStyleCustom]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 28,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  text: {
    ...textStyles.button1,
    color: "#000",
  },
});
