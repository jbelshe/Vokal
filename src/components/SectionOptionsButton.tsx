import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { theme } from '../assets/theme';

import { Switch } from 'react-native';

interface ProfileButtonProps {
  title: string;
  subtext?: string;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
  disabled?: boolean;
  onPress?: () => void;
}

export const SectionOptionsButton: React.FC<ProfileButtonProps> = ({
  title,
  subtext,
  image,
  icon,
  toggle,
  disabled = false,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={styles.imageContainer}>
    {image && <Image source={image} style={styles.image} />}
    </View>
    <View style={styles.textContainer}>
      <Text 
        style={[styles.title, theme.textStyles.title1]} 
        numberOfLines={1}
        allowFontScaling={false}
      >
        {title}
      </Text>
      {subtext && (
        <Text 
          style={[styles.subtext, theme.textStyles.caption]}
          allowFontScaling={false}
        >
          {subtext}
        </Text>
      )}
    </View>
    {toggle ? (
      <View style={styles.switchContainer}>
        <Switch
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          trackColor={{ false: '#767577', true: theme.colors.primary_gradient_end }}
          thumbColor={disabled ? '#f4f3f4' : '#f4f3f4'}
          // disabled={disabled}
        />
      </View>
    ) : (
      icon && <View style={styles.iconContainer}>{icon}</View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: 'center',
    paddingVertical: 16,
    transform: [{ scaleX: 0.9 }], // Scale down the switch to 80% of its original size
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72, // Ensure consistent height for centering
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: 20,
    height: 20,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.primary_text,
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
  },
  subtext: {
    color: theme.colors.secondary_text,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
    includeFontPadding: false,
  },
  iconContainer: {
    marginLeft: 8,
  },
});

