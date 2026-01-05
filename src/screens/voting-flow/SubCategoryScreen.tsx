import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { usePostHogAnalytics } from '../../hooks/usePostHogAnalytics';

type Props = NativeStackScreenProps<VotingStackParamList, 'SubCategory'>;

export default function SubCategoryScreen({ navigation, route }: Props) {
  const handleBack = () => {
    navigation.goBack();
  };

  const selectedCategoryCode = route.params.selectedCategoryCode;
  // const propertyId = route.params.propertyId;
  const { categoriesDataMap, categoryToSubcategoryMap, currentPropertyId } = useAppContext();
  const { subCategorySelected, setSubCategorySelected, resetVoting } = useVotingContext();
  const analytics = usePostHogAnalytics();

  const handleSubCategorySelect = (subcategory_code: string) => {
    console.log('Selected Subcategory:', subcategory_code);
    setSubCategorySelected(subcategory_code);
  };

  const handleClose = () => {
    analytics.trackVotingFlowAbandoned(currentPropertyId!, 'SubCategory');
    resetVoting();
    navigation.getParent()?.goBack();
  };

  const handleNext = () => {
    analytics.trackSubcategorySelected(subCategorySelected!, selectedCategoryCode!);
    console.log('Navigate to AdditionalNoteScreen');
    if (!subCategorySelected) {
      Alert.alert('Please select a subcategory');
      return;
    }

    navigation.navigate('AdditionalNote', { subCategorySelected });
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
          {Object.values(categoryToSubcategoryMap[selectedCategoryCode]).map((subcategory, index) => (
            <SelectableOptions
              key={index}
              title={subcategory.name}
              isSelected={subCategorySelected === subcategory.code}
              onPress={() => handleSubCategorySelect(subcategory.code)}
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