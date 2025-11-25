import React, { FC } from 'react';
import DonutChart from './DonutChart';
import PieChart, { Slice , SliceLabel} from 'react-native-pie-chart';
import { colors } from '../assets/theme/colors';
import { View, Text, StyleSheet } from 'react-native';


interface ChartData {
  value: number;
  color: string;
  label?: SliceLabel;
}

interface DonutChartWithKeyProps {
    categories: string[];
    data: ChartData[];
    size?: number;
    holeRadius?: number;
    showLabels?: boolean;
    labelColor?: string;
    labelFontSize?: number;
}

export const DonutChartWithKey : React.FC<DonutChartWithKeyProps> = ({
    categories,
    data,
    size,
    holeRadius,
    showLabels,
    labelColor,
    labelFontSize
}) => {

    return (
        <View>
            <DonutChart
                data={data}
                size={size}
                holeRadius={holeRadius}
                showLabels={showLabels}
                labelColor={labelColor}
                labelFontSize={labelFontSize}
            />
            <View style={styles.categoryLegend}>
                {categories.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                        <View style={styles.categoryColor} />
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                ))}
            </View>
        </View>

    )
    
};