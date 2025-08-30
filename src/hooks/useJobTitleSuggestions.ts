import { useMemo } from 'react';
import { getSortedSuggestions } from '@/utils/queryGenerator';

/**
 * Hook pour gérer les suggestions de titres de postes
 */
export const useJobTitleSuggestions = (
  inputValue: string,
  jobTitlesData: Record<string, string[]>,
  maxSuggestions: number = 10
) => {
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    // Récupère tous les titres de toutes les catégories
    const allTitles = Object.values(jobTitlesData).flat();
    
    // Utilise l'algorithme de tri par pertinence
    return getSortedSuggestions(inputValue, allTitles, maxSuggestions);
  }, [inputValue, jobTitlesData, maxSuggestions]);

  return suggestions;
};