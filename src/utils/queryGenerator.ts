/**
 * Utilitaires pour la génération de requêtes booléennes optimisées
 */

export type Platform = 'linkedin' | 'sales-navigator' | 'google-xray';

export interface QueryOptions {
  mode: 'free' | 'category';
  inputValue?: string;
  selectedCategory?: string;
  selectedTitles?: string[];
  customTitles?: string[];
  exclusions?: string[];
  skills?: string[];
  platform?: Platform;
  location?: string;
}

/** Limites de caractères par plateforme */
export const PLATFORM_LIMITS: Record<Platform, { label: string; limit: number; description: string }> = {
  linkedin: { label: 'LinkedIn Free', limit: 500, description: 'Recherche standard LinkedIn' },
  'sales-navigator': { label: 'Sales Navigator', limit: 1200, description: 'LinkedIn Sales Navigator' },
  'google-xray': { label: 'Google X-Ray', limit: 2048, description: 'Recherche Google site:linkedin.com' },
};

/**
 * Génère une requête booléenne optimisée
 */
export const generateBooleanQuery = (
  jobTitlesData: Record<string, string[]>,
  options: QueryOptions
): string => {
  let titles: string[] = [];
  
  if (options.mode === 'free') {
    const uniqueTitles = new Set<string>();
    [options.inputValue || '', ...(options.customTitles || []), ...(options.selectedTitles || [])]
      .filter(Boolean)
      .forEach(t => uniqueTitles.add(t));
    titles = Array.from(uniqueTitles);
  } else {
    if (options.selectedCategory && jobTitlesData[options.selectedCategory]) {
      titles = jobTitlesData[options.selectedCategory];
    }
  }
  
  if (titles.length === 0) return '';
  
  // Titre part: OR group
  const titlePart = titles.map(title => `"${title}"`).join(' OR ');

  // Wrap in parentheses if we'll add AND/NOT
  const exclusions = (options.exclusions || []).filter(Boolean);
  const skills = (options.skills || []).filter(Boolean);
  const location = (options.location || '').trim();
  const hasModifiers = exclusions.length > 0 || skills.length > 0 || location.length > 0;
  const platform = options.platform || 'linkedin';

  let query = hasModifiers ? `(${titlePart})` : titlePart;

  // AND skills
  if (skills.length > 0) {
    const skillPart = skills.map(s => `"${s}"`).join(' AND ');
    query += ` AND (${skillPart})`;
  }

  // NOT exclusions
  if (exclusions.length > 0) {
    const notPart = exclusions.map(e => `NOT "${e}"`).join(' ');
    query += ` ${notPart}`;
  }

  // Google X-Ray prefix
  if (platform === 'google-xray') {
    query = `site:linkedin.com/in/ ${query}`;
  }

  return query;
};

/**
 * Normalise un texte pour la recherche (supprime accents, casse, etc.)
 */
export const normalizeForSearch = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Calcule un score de pertinence entre un terme de recherche et un titre
 */
export const calculateRelevanceScore = (searchTerm: string, title: string): number => {
  const normalizedSearch = normalizeForSearch(searchTerm);
  const normalizedTitle = normalizeForSearch(title);
  
  if (normalizedTitle === normalizedSearch) return 1000;
  if (normalizedTitle.startsWith(normalizedSearch)) return 800;
  if (normalizedTitle.includes(normalizedSearch)) return 600;
  
  const searchWords = normalizedSearch.split(/\s+/);
  const titleWords = normalizedTitle.split(/\s+/);
  
  let wordMatchScore = 0;
  for (const searchWord of searchWords) {
    if (searchWord.length < 2) continue;
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
