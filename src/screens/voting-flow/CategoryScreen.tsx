import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VotingStackParamList } from '../../types/navigation';
import { theme } from '../../assets/theme';
import CloseIcon from '../../assets/icons/close.svg';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { SelectableOptions } from '../../components/SelectableOptions';
import { PurpleButtonLarge } from '../../components/PurpleButtonLarge';
import { votingScreenStyles } from '../../assets/theme/votingFlowStyles';
import { useAppContext } from '../../context/AppContext';
import { useVotingContext } from '../../context/VotingContext';


type Props = NativeStackScreenProps<VotingStackParamList, 'Category'>;

export default function CategoryScreen({ navigation, route }: Props) {

  const { categoriesDataMap } = useAppContext();
  const { categorySelected, setCategorySelected } = useVotingContext();
  const [selectedCategoryCode, setSelectedCategoryCode] = React.useState<string | null>(null);


  const handleClose = () => {
    navigation.getParent()?.goBack();
  };


  const handleNext = () => {
    console.log('Navigate to SubCategoryScreen');
    navigation.navigate('SubCategory', { selectedCategoryCode: selectedCategoryCode! });
  };

  const handleCategorySelect = (category: string) => {
    setCategorySelected(category);
    setSelectedCategoryCode(category);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBarContainer}>
        <TouchableOpacity style={styles.backButton} disabled>
          <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Category</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <ProgressIndicator
          totalSteps={3}
          currentStep={0}
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
          {Object.values(categoriesDataMap).map((category, index) => (
            <SelectableOptions
              key={index}
              image_code={category.code}
              title={category.name}
              description={category.description}
              isSelected={selectedCategoryCode === category.code}
              onPress={() => handleCategorySelect(category.code)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <PurpleButtonLarge
          disabled={!categorySelected}
          title="Next"
          onPress={handleNext}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  ...votingScreenStyles,
  backButton: {
    ...votingScreenStyles.backButton,
    opacity: 0, // Specific to CategoryScreen
  },
  // Add any screen-specific styles here
});

