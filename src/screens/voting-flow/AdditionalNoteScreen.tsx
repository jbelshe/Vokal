import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../assets/theme';
import CloseIcon from '../../assets/icons/close.svg';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { PurpleButtonLarge } from '../../components/PurpleButtonLarge';
import { useAppContext } from '../../context/AppContext';
import { VotingStackParamList } from '../../types/navigation';
import { votingScreenStyles } from '../../assets/theme/votingFlowStyles';
import { useVotingContext } from '../../context/VotingContext';

type Props = NativeStackScreenProps<VotingStackParamList, 'AdditionalNote'>;

export default function AdditionalNoteScreen({ navigation, route }: Props) {
  const maxLength = 150;

  const { currentPropertyId } = useAppContext();
  const { additionalNote, setAdditionalNote } = useVotingContext();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClose = () => {
    navigation.getParent()?.goBack();
  };

  const handleSendVote = () => {
    const sanitizedNode = additionalNote.trim()
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .substring(0, maxLength);
    console.log('Send vote with note:', sanitizedNode);
    navigation.getParent()?.goBack();
  };

  const handleNoteChange = (text: string) => {
    if (text.length <= maxLength) {
      setAdditionalNote(text);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBarContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Additional Notes</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <ProgressIndicator
          totalSteps={3}
          currentStep={2}
          height={8}
          spacing={4}
          borderRadius={4}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your note here..."
            placeholderTextColor={theme.colors.secondary_text}
            value={additionalNote}
            onChangeText={handleNoteChange}
            multiline
            maxLength={maxLength}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            Remaining {additionalNote.length}/{maxLength}
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <PurpleButtonLarge
          title="Send Vote"
          onPress={handleSendVote}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  ...votingScreenStyles,
  textInputContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface1,
    borderRadius: 12,
    padding: 16,
    height: 200,
  },
  textInput: {
    color: theme.colors.primary_text,
    fontSize: 16,
    fontFamily: theme.textStyles.body.fontFamily,
    lineHeight: 24,
  },
  characterCount: {
    position: 'absolute',
    alignSelf: 'flex-start',
    top: 210,
    fontSize: 12,
    left: 20,
    color: theme.colors.secondary_text,
  },
});
