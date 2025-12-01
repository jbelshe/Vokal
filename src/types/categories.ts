import { ImageSourcePropType } from 'react-native';

export type Subcategory = {
  name: string;
  id: number;
  code: string;
};

export type CategoryWithSubcategories = {
  id: number;
  name: string;
  code: string;
  description: string;
  subcategories: Subcategory[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export interface CategoryImageMap {
  [key: string]: ImageSourcePropType;
}

export const categoryImageMap: CategoryImageMap = {
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
  "other": require("../assets/icons/categories/more.png"),
  "restaurant": require("../assets/icons/categories/plate.png"),
  "retail": require("../assets/icons/categories/shop_bag.png"),
  "health_and_wellness": require("../assets/icons/categories/yoga.png"),
  "cafe_and_coffee": require("../assets/icons/categories/coffee.png"),
} as const;

export type CategoryImageKey = keyof typeof categoryImageMap;

export type CategoryMap = {
  [categoryCode: string]: Subcategory[];
};