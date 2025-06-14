import React, { createContext, useContext, ReactNode } from 'react';
import  supabase  from '../lib/supabase';

interface DatabaseContextType {
  supabase: typeof supabase;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const value = {
    supabase,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
