// src/context/VotingContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

type VotingContextType = {
  categorySelected: string | null;
  setCategorySelected: (category: string) => void;
  subCategorySelected: string | null;
  setSubCategorySelected: (subCategory: string) => void;
  additionalNote: string | "";
  setAdditionalNote: (note: string) => void;
};

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {

  const [categorySelected, setCategorySelected] = React.useState<string | null>(null);
  const [subCategorySelected, setSubCategorySelected] = React.useState<string | null>(null);
  const [additionalNote, setAdditionalNote] = React.useState<string | "">("");

  return (
    <VotingContext.Provider value={{
      categorySelected,
      setCategorySelected,
      subCategorySelected,
      setSubCategorySelected,
      additionalNote,
      setAdditionalNote,
    }}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVotingContext() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}