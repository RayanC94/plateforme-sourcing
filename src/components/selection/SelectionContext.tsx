'use client';

import React, { createContext, useContext, useState } from 'react';

interface SelectionContextType {
  selectedRequests: string[];
  selectedGroups: string[];
  toggleRequest: (id: string) => void;
  toggleGroup: (id: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleRequest = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedRequests([]);
    setSelectedGroups([]);
  };

  return (
    <SelectionContext.Provider
      value={{ selectedRequests, selectedGroups, toggleRequest, toggleGroup, clearSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

