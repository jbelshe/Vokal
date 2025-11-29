import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DonutChart from '../components/DonutChart';
import { colors } from '../assets/theme/colors';
import { theme } from '../assets/theme';
import CloseIcon from '../assets/icons/close.svg';
import { CloseButtonLarge } from '../components/CloseButtonLarge';
import { Platform } from 'react-native';

type props = NativeStackScreenProps<AppStackParamList, 'VotingResults'>;




const calculatePercentage = (value: number, total: number): string => {
    return `${Math.round((value / total) * 100)}%`;
};

export default function VotingResults({ navigation }: props) {
    const values = [321, 185, 430, 200, 100, 83];
    const color_group = [colors.primary_gradient_start, colors.primary_gradient_end, colors.donut1, colors.donut2, colors.donut3, colors.donut4];
    const total = values.reduce((sum, val) => sum + val, 0);
    
    const chartData = [
        { value: values[0], color: color_group[0], label: { text: calculatePercentage(values[0], total), fill: "#FFF" } },
        { value: values[1], color: color_group[1], label: { text: calculatePercentage(values[1], total), fill: "#FFF" } },
        { value: values[2], color: color_group[2], label: { text: calculatePercentage(values[2], total), fill: "#FFF" } },
        { value: values[3], color: color_group[3], label: { text: calculatePercentage(values[3], total), fill: "#FFF" } },
        { value: values[4], color: color_group[4], label: { text: calculatePercentage(values[4], total), fill: "#FFF" } },
        { value: values[5], color: color_group[5], label: { text: calculatePercentage(values[5], total), fill: "#FFF" } },
    ];
    const chartInfo = {
        categories: [
            { name: "Chinese", image_code: "chinese" },
            { name: "Clothing", image_code: "clothing" },
            { name: "Thai", image_code: "thai" },
            { name: "Fitness Studio", image_code: "fitness_studio" },
            { name: "Bakery", image_code: "bakery" },
            { name: "Other", image_code: "health_wellness_other" },
        ],
        data: chartData,
    }

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
                    categories={chartInfo.categories}
                    data={chartInfo.data}
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



