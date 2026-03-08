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
  const allTitles = useMemo(
    () => Object.values(jobTitlesData).flat(),
    [jobTitlesData]
  );

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    return getSortedSuggestions(inputValue, allTitles, maxSuggestions);
  }, [inputValue, allTitles, maxSuggestions]);

  return suggestions;
};