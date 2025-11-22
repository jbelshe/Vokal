export type Subcategory = {
  name: string;
  category_id: number;
  code: string;
};

export type CategoryWithSubcategories = {
  id: number;
  name: string;
  code: string;
  description: string;
  subcategories: Subcategory[];
};

export type CategoryMap = {
  [categoryName: string]: Subcategory[];
};