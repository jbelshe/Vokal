import { VotingStackParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { VoteDetails } from '@/components/VoteDetails';
import { DisplayVote } from '@/types/vote';
import { useVotingContext } from '@/context/VotingContext';
import { useAppContext } from '@/context/AppContext';
import { theme } from '@/assets/theme';
import CloseIcon from '@/assets/icons/close.svg';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { votingScreenStyles } from '@/assets/theme/votingFlowStyles';
import { StyleSheet } from 'react-native';
import DonutChart from '@/components/DonutChart';
import CheckMarkIcon from '@/assets/icons/check_filled.svg';
import { colors } from '@/assets/theme/colors';
import { VoteTally } from '@/types/vote';
import { PurpleButtonLarge } from '@/components/PurpleButtonLarge';
import { CloseButtonLarge } from '@/components/CloseButtonLarge';
import { Platform } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
const { width, height } = Dimensions.get("window");




const calculatePercentage = (value: number, total: number): string => {
    return `${Math.round((value / total) * 100)}%`;
};


type props = NativeStackScreenProps<VotingStackParamList, 'VoteConfirm'>;

export default function VoteConfirmScreen({ navigation, route }: props) {
    // const { note } = route.params;
    const { vote_data } = route.params;

    const color_group = [colors.primary_gradient_start, colors.primary_gradient_end, colors.donut1, colors.donut2, colors.donut3, colors.donut4];
    console.log("VOTE DATA:", vote_data);
    const chartData = vote_data ? vote_data.top_categories.map((category: VoteTally, index: number) => {
        return {
            value: category.count,
            color: color_group[index],
            label: { text: calculatePercentage(category.count, vote_data.total_votes), fill: "#FFF" },
        };
    }) : [];

    const chartInfo: { name: string, image_code: string }[] = vote_data ? vote_data.top_categories.map((category: VoteTally, index: number) => {
        return { name: category.category_name, image_code: category.category_code }
    }) : [];



    const { categorySelected, subCategorySelected, additionalNote, resetVoting } = useVotingContext();
    const { categoriesDataMap, subcategoryToIdMap, idToCategoryMap } = useAppContext();

    console.log("Category Selected:", categoriesDataMap[categorySelected!].name);
    console.log("Subcategory Selected:", idToCategoryMap[subcategoryToIdMap[subCategorySelected!]].name);
    console.log("Additional Note:", additionalNote);
    console.log("Subcategory To Category Map:");
    console.log("ID To Category Map:", idToCategoryMap);

    const voteDetails: DisplayVote = {
        category: categoriesDataMap[categorySelected!].name,
        category_code: categorySelected!,
        subcategory: idToCategoryMap[subcategoryToIdMap[subCategorySelected!]].name,
        subcategory_code: subCategorySelected!,
        additional_note: additionalNote!,
    };


    const handleClose = () => {
        
        resetVoting();
        navigation.getParent()?.goBack();
    };

    const handleBackToMain = () => {    
        resetVoting();
        navigation.getParent()?.goBack();
        navigation.getParent()?.goBack();
    };


    return (
        <View style={styles.container}>
            <ConfettiCannon
                count={400}
                origin={{x: -10, y: 0}}
                fallSpeed={3000}
                fadeOut={true}
                autoStart={true}
                explosionSpeed={400}
                autoStartDelay={0}    
            />
            {/* Header */}
            <View style={styles.topBarContainer}>
                <TouchableOpacity style={styles.backButton} disabled>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, theme.textStyles.title1]}></Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                   <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.confirmContainer}>
                    <Text style={[theme.textStyles.headline2]}>Thanks for voting!</Text>
                    <CheckMarkIcon width={56} height={56} fill={theme.colors.primary_text} />
                    <Text style={[theme.textStyles.caption, { textAlign: 'center' }]}>Your vote just helped shape the future of this space.</Text>
                </View>
                <VoteDetails selectionDetails={voteDetails} />
                <Text style={[theme.textStyles.title1, { textAlign: 'center', }]}>Here's What Others Are Saying</Text>
                <DonutChart
                    data={chartData}
                    categories={chartInfo}
                    size={280}
                    holeRadius={0.5}
                    showLabels={true}
                />
                <PurpleButtonLarge
                    style={{ marginTop: 20 }}
                    title="Vote on another spot"
                    onPress={() => handleBackToMain()}
                />
                <CloseButtonLarge
                    style={{ marginTop: 20, marginBottom: 50 }}
                    title="Close"
                    onPress={() => handleClose()}
                />
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    ...votingScreenStyles, 
    backButton: {
        ...votingScreenStyles.backButton,
        opacity: 0, // Specific to CategoryScreen
    },
    headerTitle: {
        ...votingScreenStyles.headerTitle,
        opacity: 0, // Specific to CategoryScreen
    },
    closeButtonContainer: {
        width: '100%',
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 20 : 40,
        alignItems: 'flex-end',
        backgroundColor: theme.colors.background,
    },

    confirmContainer: {
        paddingTop: 16,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 0,
        backgroundColor: theme.colors.surface1,
        borderRadius: 12,
        padding: 20,
        gap: 20
    },
})