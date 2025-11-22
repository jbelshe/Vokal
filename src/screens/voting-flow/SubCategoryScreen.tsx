import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
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
import { SelectableOptions } from '../../components/SelectableOptions';

type Props = NativeStackScreenProps<VotingStackParamList, 'SubCategory'>;

export default function SubCategoryScreen({ navigation, route }: Props) {
  const handleBack = () => {
    navigation.goBack();
  };

  const selectedCategory = route.params.selectedCategory;
  // const propertyId = route.params.propertyId;
  const { categories, categoryMap } = useAppContext();
  const { subCategorySelected, setSubCategorySelected } = useVotingContext();

  const handleSubCategorySelect = (subcategory: string) => {
    console.log('Selected Subcategory:', subcategory);
    setSubCategorySelected(subcategory);
  };

  const handleClose = () => {
    navigation.getParent()?.goBack();
  };

  const handleNext = () => {
    console.log('Navigate to AdditionalNoteScreen');
    navigation.navigate('AdditionalNote');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBarContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Subcategory</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <ProgressIndicator
          totalSteps={3}
          currentStep={1}
          height={8}
          spacing={4}
          borderRadius={4}
                />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonsContainer}>
          {categoryMap[selectedCategory].map((subcategory, index) => (
            <SelectableOptions
              key={index}
              title={subcategory.name}
              isSelected={subCategorySelected === subcategory.name}
              onPress={() => handleSubCategorySelect(subcategory.name)}
              image_code={subcategory.code}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <PurpleButtonLarge
          title="Next"
          onPress={handleNext}
          disabled={!subCategorySelected}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  ...votingScreenStyles,
  // Add any screen-specific styles here
});