import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Region } from 'react-native-maps';
import { Property } from '../api/properties';

interface AppContextType {
  // Map state
  mapRegion: Region | null;
  setMapRegion: (region: Region | null) => void;
  
  // Properties state
  properties: Property[];
  setProperties: (properties: Property[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  return (
    <AppContext.Provider
      value={{
        mapRegion,
        setMapRegion,
        properties,
        setProperties,
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

