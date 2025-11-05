import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface ProfileIconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
}

export const ProfileIconButton: React.FC<ProfileIconButtonProps> = ({
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

