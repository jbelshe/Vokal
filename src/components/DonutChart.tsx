import React, { FC } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import PieChart, { Slice, SliceLabel } from 'react-native-pie-chart';
import { colors } from '../assets/theme/colors';
import { theme } from '../assets/theme';
import { categoryImageMap, CategoryImageKey } from '../types/categories';


interface ChartData {
    value: number;
    color: string;
    label?: SliceLabel;
}

interface CategoriesData {
    name: string;
    image_code: CategoryImageKey;
}

interface DonutChartProps {
    data: ChartData[];
    size?: number;
    holeRadius?: number;
    showLabels?: boolean;
    categories?: CategoriesData[];
    labelColor?: string;
    labelFontSize?: number;
}

const DonutChart: FC<DonutChartProps> = ({
    data,
    size = 250,
    holeRadius = 0.45,
    showLabels = true,
    categories,
}) => {
    const cover = { radius: holeRadius, color: '#FFF' }
    

    return (
        <View style={styles.container}>
            <View style={styles.chartContainer}>
                <PieChart
                    widthAndHeight={size}
                    series={data}
                    cover={cover}
                />
            </View>

            {showLabels && (
                <View style={styles.legendContainer}>
                    {categories?.map((category, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: data[index].color }]} />
                            <View style={styles.legendIcon}>
                                <Image source={categoryImageMap[category.image_code]} style={styles.image} />
                            </View>
                            <Text 
                                style={[theme.textStyles.title2, styles.legendText]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {category.name}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 16,
    },
    chartContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    centerText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        textAlign: 'center',
        marginTop: 4,
    },
    legendContainer: {
        width: '100%',
        marginTop: 16,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    legendItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        backgroundColor: colors.surface1,
        padding: 8,
        borderRadius: 12,
        marginHorizontal: 5,
        minHeight: 60,
    },
    legendText: {
        flex: 1,
        flexWrap: 'wrap',
        marginLeft: 8,
    },
    legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: 6,
        marginRight: 8,
    },
    legendIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
        backgroundColor: "#FFF",
        alignItems: 'center',
        justifyContent: 'center',
    },    
    image: {
        width: 24,
        height: 24,
    },
});

export default DonutChart;