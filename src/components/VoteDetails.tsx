import { View, Text, Image, StyleSheet } from "react-native";
import { DisplayVote } from "../types/vote";
import { categoryImageMap } from "../types/categories";
import { theme } from "../assets/theme";


interface VoteDetailsProps {
    selectionDetails: DisplayVote 
}



export const VoteDetails: React.FC<VoteDetailsProps> = ({ selectionDetails }) => {
    return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                    You Voted for
                </Text>
                <View style={styles.votedForCategoryContainer}>
                    <View style={styles.legendIcon}>
                        <Image source={categoryImageMap[selectionDetails.category_code]} style={styles.image} />
                    </View>
                    <Text style={[styles.sectionText, theme.textStyles.title1]}>
                        {selectionDetails.category}
                    </Text>
                </View>
                <View style={[styles.votedForSubCategoryContainer, !selectionDetails.additional_note ? { marginBottom: 50 } : null]}>
                    <View style={styles.legendIcon}>
                        <Image source={categoryImageMap[selectionDetails.subcategory_code]} style={styles.image} />
                    </View>
                    <Text style={[styles.sectionText, theme.textStyles.title1]}>
                        {selectionDetails.subcategory}
                    </Text>
                </View>
                {selectionDetails.additional_note && (
                    <View style={styles.votedForAdditionalNoteContainer}>
                        <Text style={[styles.sectionText, theme.textStyles.title2]}>
                            {selectionDetails.additional_note}
                        </Text>
                    </View>
                )}
            </View>
    );
}


const styles = StyleSheet.create({
    section: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface2,
  },
  sectionTitle: {
    paddingTop: 10,
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
    color: theme.colors.primary_text,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.primary_text,

  },
    votedForCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: theme.colors.surface1,
        height: 60,
        borderRadius: 12,
        marginTop: 12,
        padding: 16,
        justifyContent: 'flex-start',
    },
    votedForSubCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: theme.colors.surface1,
        height: 60,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'flex-start',
    },
    votedForAdditionalNoteContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 50,
        backgroundColor: theme.colors.surface1,
        height: 120,
        borderRadius: 12,
        padding: 16,
    },
    legendIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: "#FFF",
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 24,
        height: 24,
    },

});