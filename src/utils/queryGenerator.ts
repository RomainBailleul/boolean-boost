/**
 * Utilitaires pour la génération de requêtes booléennes optimisées
 */

export interface QueryOptions {
  mode: 'free' | 'category';
  inputValue?: string;
  selectedCategory?: string;
  selectedTitles?: string[];
  customTitles?: string[];
}

/**
 * Génère une requête booléenne optimisée
 */
export const generateBooleanQuery = (
  jobTitlesData: Record<string, string[]>,
  options: QueryOptions
): string => {
  let titles: string[] = [];
  
  if (options.mode === 'free') {
    // Mode recherche libre
    titles = [
      options.inputValue || '',
      ...(options.customTitles || []),
      ...(options.selectedTitles || [])
    ].filter(Boolean);
  } else {
    // Mode catégorie
    if (options.selectedCategory && jobTitlesData[options.selectedCategory]) {
      titles = jobTitlesData[options.selectedCategory];
    }
  }
  
  if (titles.length === 0) return '';
  
  // Génération de la requête avec guillemets pour les termes exacts
  return titles.map(title => `"${title}"`).join(' OR ');
};

/**
 * Normalise un texte pour la recherche (supprime accents, casse, etc.)
 */
export const normalizeForSearch = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .trim();
};

/**
 * Calcule un score de pertinence entre un terme de recherche et un titre
 */
export const calculateRelevanceScore = (searchTerm: string, title: string): number => {
  const normalizedSearch = normalizeForSearch(searchTerm);
  const normalizedTitle = normalizeForSearch(title);
  
  // Score exact match (priorité maximale)
  if (normalizedTitle === normalizedSearch) return 1000;
  
  // Score début de mot
  if (normalizedTitle.startsWith(normalizedSearch)) return 800;
  
  // Score contient le terme complet
  if (normalizedTitle.includes(normalizedSearch)) return 600;
  
  // Score pour les mots individuels
  const searchWords = normalizedSearch.split(/\s+/);
  const titleWords = normalizedTitle.split(/\s+/);
  
  let wordMatchScore = 0;
  for (const searchWord of searchWords) {
    if (searchWord.length < 2) continue; // Ignore les mots trop courts
    
    for (const titleWord of titleWords) {
      if (titleWord.startsWith(searchWord)) {
        wordMatchScore += 100;
      } else if (titleWord.includes(searchWord)) {
        wordMatchScore += 50;
      }
    }
  }
  
  return wordMatchScore;
};

/**
 * Filtre et trie les suggestions par pertinence
 */
export const getSortedSuggestions = (
  searchTerm: string,
  allTitles: string[],
  maxResults: number = 10
): string[] => {
  if (!searchTerm.trim()) return [];
  
  const suggestions = allTitles
    .map(title => ({
      title,
      score: calculateRelevanceScore(searchTerm, title)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.title);
    
  return suggestions;
};