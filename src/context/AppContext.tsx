import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Region } from 'react-native-maps';
import { Property } from '../api/properties';
import { loadCategoriesAll } from '../api/voting';
import { CategoryMap, CategoryWithSubcategories } from '../types/categories';

interface AppContextType {
  // Map state
  mapRegion: Region | null;
  setMapRegion: (region: Region | null) => void;
  // Categories state
  categories: CategoryWithSubcategories[];
  setCategories: (categories: CategoryWithSubcategories[]) => void;
  categoryMap: CategoryMap;
  setCategoryMap: (categoryMap: CategoryMap) => void;
  // Properties state
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  // Current property ID state
  currentPropertyId: string | null;
  setCurrentPropertyId: (propertyId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // console.log("Fetching Categories...")
        const { categoriesData, categoryMap } = await loadCategoriesAll();  // async function but non-blocking 
        const allSubcategoryCodes = categoriesData.flatMap(category => 
            category.subcategories.map(sub => sub.code)
        );
        // console.log("All subcategory codes:", allSubcategoryCodes);
        setCategories(categoriesData);
        setCategoryMap(categoryMap);
        // console.log("Categories Fetched")
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);


  
  return (
    <AppContext.Provider
      value={{
        mapRegion,
        setMapRegion,
        properties,
        setProperties,
        currentPropertyId,
        setCurrentPropertyId,
        categories,
        setCategories,
        categoryMap,
        setCategoryMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

