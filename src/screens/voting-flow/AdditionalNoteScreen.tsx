import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
import { submitVote } from '../../api/voting';
import { useAuth } from '../../context/AuthContext';
type Props = NativeStackScreenProps<VotingStackParamList, 'AdditionalNote'>;

export default function AdditionalNoteScreen({ navigation, route }: Props) {
  const maxLength = 50;
  const subCategorySelected = route.params.subCategorySelected;
  const { properties, setProperties, currentPropertyId, subcategoryToIdMap } = useAppContext();
  const { state } = useAuth();
  const { additionalNote, setAdditionalNote } = useVotingContext();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClose = () => {
    navigation.getParent()?.goBack();
  };

  const handleSendVote = async () => {





    const sanitizedNode = additionalNote.trim()
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .substring(0, maxLength);
    console.log('Send vote with note:', sanitizedNode);
    console.log("User ID:", state.profile!.userId!);
    console.log("Property ID:", currentPropertyId!);
    console.log("Subcategory Selected:", subCategorySelected);
    console.log("Subcategory ID:", subcategoryToIdMap[subCategorySelected]);
    console.log("Note:", sanitizedNode);
    const success = await submitVote(state.profile!.userId!, currentPropertyId!, subcategoryToIdMap[subCategorySelected], sanitizedNode);
    if (!success) {
      console.error('Failed to submit vote');
      return;
    }

    const property = properties.find((property) => property.id === currentPropertyId);
    if (!property) {
      console.error('Property not found');
      return;
    }
    console.log("Property:", property);

    // Update the property's vote information in the local state
    const updatedProperties = properties.map(p => {
      if (p.id === currentPropertyId) {
        return {
          ...p,
          vote: {
            choice_id: subcategoryToIdMap[subCategorySelected],
            free_text: sanitizedNode
          }
        };
      }
      return p;
    });

    // Update the properties in the context
    setProperties(updatedProperties);

    navigation.getParent()?.goBack();
  };

  const handleNoteChange = (text: string) => {
    if (text.length <= maxLength) {
      setAdditionalNote(text);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <View style={styles.textInputContainer} >
            <TextInput
              style={styles.textInput}
              placeholder="Enter your note here..."
              placeholderTextColor={theme.colors.secondary_text}
              value={additionalNote}
              onChangeText={handleNoteChange}
              multiline
              maxLength={maxLength}
              textAlignVertical="top"
              onFocus={(e) => e.target.focus()}
              autoFocus
            />
          </View>
          <View style={styles.characterCountContainer}>
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
    </TouchableWithoutFeedback>
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
    flex: 1,
    color: theme.colors.primary_text,
    fontSize: 16,
    fontFamily: theme.textStyles.body.fontFamily,
    lineHeight: 24,
  },
  characterCountContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
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
