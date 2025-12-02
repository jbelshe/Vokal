import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Region } from 'react-native-maps';
import { Property } from '../types/property';
import { loadCategoriesAll } from '../api/voting';
import { CategoryMap, CategoryWithSubcategories } from '../types/categories';
import { TopVoteResults } from '../types/vote';

interface AppContextType {
  // Map state
  mapRegion: Region | null;
  setMapRegion: (region: Region | null) => void;
  // Categories state
  categoriesDataMap: Record<string, CategoryWithSubcategories>;
  setCategoriesDataMap: (categoriesDataMap: Record<string, CategoryWithSubcategories>) => void;
  categoryToSubcategoryMap: CategoryMap;
  setCategoryToSubcategoryMap: (categoryToSubcategoryMap: CategoryMap) => void;
  subcategoryToIdMap: Record<string, string>;
  setSubcategoryToIdMap: (subcategoryToIdMap: Record<string, string>) => void;
  // Properties state
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  // Current property ID state
  currentPropertyId: string | null;
  setCurrentPropertyId: (propertyId: string | null) => void;
  idToCategoryMap: Record<string, { code: string; name: string }>;
  setIdToCategoryMap: (idToCategoryMap: Record<string, { code: string; name: string }>) => void;
  subcategoryToCategoryMap: Record<string, string>;
  setSubcategoryToCategoryMap: (subcategoryToCategoryMap: Record<string, string>) => void;
  currentTopVotes: TopVoteResults | null;
  setCurrentTopVotes: (topVotes: TopVoteResults | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);
  const [currentTopVotes, setCurrentTopVotes] = useState<TopVoteResults | null>(null);

  const [categoriesDataMap, setCategoriesDataMap] = useState<Record<string, CategoryWithSubcategories>>({});
  const [categoryToSubcategoryMap, setCategoryToSubcategoryMap] = useState<CategoryMap>({});
  const [subcategoryToIdMap, setSubcategoryToIdMap] = useState<Record<string, string>>({});
  const [idToCategoryMap, setIdToCategoryMap] = useState<Record<string, { code: string; name: string }>>({});
  const [subcategoryToCategoryMap, setSubcategoryToCategoryMap] = useState<Record<string, string>>({});


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // console.log("Fetching Categories...")
        const { categoriesDataMap, categoryToSubcategoryMap, subcategoryToIdMap, idToCategoryMap, subcategoryToCategoryMap } = await loadCategoriesAll();  // async function but non-blocking 

        // Create mapping from subcategory name to category name
        // const subcategoryToCategoryMap = Object.entries(categoryMap).reduce((acc, [categoryName, subcategories]) => {
        //   subcategories.forEach(subcategory => {
        //     acc[subcategory.name] = categoryName;
        //   });
        //   return acc;
        // }, {} as Record<string, string>);
        console.log("Subcategory to Category Map:", subcategoryToCategoryMap)


        setCategoriesDataMap(categoriesDataMap);
        setCategoryToSubcategoryMap(categoryToSubcategoryMap);
        setSubcategoryToIdMap(subcategoryToIdMap);
        setIdToCategoryMap(idToCategoryMap);
        setSubcategoryToCategoryMap(subcategoryToCategoryMap);
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
        categoriesDataMap,
        setCategoriesDataMap,
        categoryToSubcategoryMap,
        setCategoryToSubcategoryMap,
        subcategoryToIdMap,
        setSubcategoryToIdMap,
        idToCategoryMap,
        setIdToCategoryMap,
        subcategoryToCategoryMap,
        setSubcategoryToCategoryMap,
        currentTopVotes,
        setCurrentTopVotes,
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

