// src/components/SelectableOptions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { theme } from '../assets/theme';


interface CategoryImageMap {
    [key: string]: ImageSourcePropType;
}

const categoryImageMap: CategoryImageMap = {
    "italian": require("../assets/icons/categories/pasta.png"),
    "japanese": require("../assets/icons/categories/sushi.png"),
    "mexican": require("../assets/icons/categories/taco.png"),
    "american": require("../assets/icons/categories/burger.png"),
    "veggie": require("../assets/icons/categories/salad.png"),
    "mediterranean": require("../assets/icons/categories/olive.png"),
    "thai": require("../assets/icons/categories/thai.png"),
    "chinese": require("../assets/icons/categories/ramen.png"),
    "restaurant_other": require("../assets/icons/categories/more.png"),
    "coffee_shop": require("../assets/icons/categories/coffee.png"),
    "tea_house": require("../assets/icons/categories/tea.png"),
    "bakery": require("../assets/icons/categories/bakery.png"),
    "brunch_spot": require("../assets/icons/categories/omlet.png"),
    "juice_bar": require("../assets/icons/categories/soda.png"),
    "cafe_coffee_other": require("../assets/icons/categories/more.png"),
    "clothing": require("../assets/icons/categories/clothes.png"),
    "home_decor": require("../assets/icons/categories/chair.png"),
    "electronics": require("../assets/icons/categories/phone.png"),
    "sporting_goods": require("../assets/icons/categories/skis.png"),
    "specialty_foods": require("../assets/icons/categories/cheese.png"),
    "retail_other": require("../assets/icons/categories/more.png"),
    "fitness_studio": require("../assets/icons/categories/fitness.png"),
    "spa_wellness": require("../assets/icons/categories/beauty.png"),
    "healthy_food_stores": require("../assets/icons/categories/avocado.png"),
    "beauty_salon": require("../assets/icons/categories/hair.png"),
    "health_wellness_other": require("../assets/icons/categories/more.png"),
    "restaurant": require("../assets/icons/categories/plate.png"),
    "retail": require("../assets/icons/categories/shop_bag.png"),
    "health_and_wellness": require("../assets/icons/categories/yoga.png"),
    "cafe_and_coffee": require("../assets/icons/categories/coffee.png"),
} as const;

type CategoryImageKey = keyof typeof categoryImageMap;

interface SelectableOptionsProps {
    title: string;
    description?: string;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
    image_code: CategoryImageKey;
}

export const SelectableOptions: React.FC<SelectableOptionsProps> = ({
    title,
    description,
    isSelected,
    onPress,
    disabled = false,
    image_code,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.selectedContainer, { height: description ? 80 : 60 }]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <View style={styles.imageContainer}>
                {<Image source={categoryImageMap[image_code]} style={styles.image} />}
            </View>
            <View style={styles.textContainer}>
            <Text
                style={[styles.title, theme.textStyles.title2]}
                numberOfLines={1}
                allowFontScaling={false}
            >
                {title}
            </Text>
            {description && (
                <Text
                    style={[styles.description, theme.textStyles.caption]}
                    numberOfLines={2}
                    allowFontScaling={false}
                >
                    {description}
                </Text>
            )}
            </View>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginVertical: 4,
        backgroundColor: theme.colors.surface1,
        borderRadius: 8,
    },
    selectedContainer: {
        backgroundColor: theme.colors.surface2,
        borderColor: theme.colors.primary_gradient_start,
        borderWidth: 1,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    imageContainer: {
        backgroundColor: "#fff",
        borderRadius: 60,
        padding: 8,
        marginRight: 16,
        overflow: 'hidden',
    },
    image: {
        width: 24,
        height: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary_gradient_start,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: theme.colors.primary_gradient_start,
    },
    checkmark: {
        color: "#fff",
        fontSize: 14,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    title: {
        marginBottom: 2, 
    },
    description: {
        opacity: 0.7, 
    },
});