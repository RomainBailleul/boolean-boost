import { useState, useEffect, useCallback } from 'react';

export interface SavedQuery {
  id: string;
  label: string;
  query: string;
  titlesCount: number;
  createdAt: string;
}

const STORAGE_KEY = 'boolean-boost-saved-queries';

export const useSavedQueries = () => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedQueries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = (queries: SavedQuery[]) => {
    setSavedQueries(queries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch {
      /* localStorage quota exceeded — state updated in memory only */
    }
  };

  const saveQuery = useCallback((label: string, query: string, titlesCount: number) => {
    const entry: SavedQuery = {
      id: crypto.randomUUID(),
      label: label.trim() || `Requête du ${new Date().toLocaleDateString('fr-FR')}`,
      query,
      titlesCount,
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...savedQueries]);
    return entry;
  }, [savedQueries]);

  const deleteQuery = useCallback((id: string) => {
    persist(savedQueries.filter(q => q.id !== id));
  }, [savedQueries]);

  return { savedQueries, saveQuery, deleteQuery };
};
