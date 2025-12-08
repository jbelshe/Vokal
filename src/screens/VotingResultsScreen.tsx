import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import DonutChart from '../components/DonutChart';
import { colors } from '../assets/theme/colors';
import { theme } from '../assets/theme';
import CloseIcon from '../assets/icons/close.svg';
import { CloseButtonLarge } from '../components/CloseButtonLarge';
import { VoteTally } from '../types/vote';

type props = NativeStackScreenProps<AppStackParamList, 'VotingResults'>;




const calculatePercentage = (value: number, total: number): string => {
    return `${Math.round((value / total) * 100)}%`;
};

export default function VotingResults({ navigation, route }: props) {
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
    
    const chartInfo : { name: string, image_code: string }[] = vote_data ? vote_data.top_categories.map((category: VoteTally, index: number) => {
        return { name: category.category_name, image_code: category.category_code }
    }) : [];


    const handleClose = () => {
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBarContainer}>
                <Text style={[styles.headerTitle, theme.textStyles.title1]}>Real-Time Results</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
                </TouchableOpacity>
            </View>
            <View style={styles.bodyContainer}>
                <DonutChart
                    categories={chartInfo}
                    data={chartData}
                    size={280}
                    holeRadius={0.5}
                    showLabels={true}
                />
            </View>


            <View style={styles.buttonContainer}>
                <CloseButtonLarge
                    title="Close"
                    onPress={() => handleClose()}
                />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topBarContainer: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: Platform.OS === 'android' ? 20 : 50,
        textAlign: 'center',
        paddingVertical: 12,
        color: theme.colors.primary_text,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: Platform.OS === 'android' ? 20 : 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11,
    },
    bodyContainer: {
        flex: 1,
        position: 'relative',
        bottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Platform.OS === 'ios' ? 48 : 24,
        paddingTop: 16,
    },
    categoryLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 12,
        color: theme.colors.primary_text,
    },
});



