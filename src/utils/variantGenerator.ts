/**
 * Génération automatique de variantes FR/EN/genre/acronymes
 */

import { normalizeForSearch } from './queryGenerator';

// Mapping acronymes ↔ titres complets (FR + EN)
const ACRONYM_MAP: Record<string, { fr_m: string; fr_f: string; en: string[] }> = {
  'drh': { fr_m: 'Directeur des Ressources Humaines', fr_f: 'Directrice des Ressources Humaines', en: ['HR Director', 'Head of HR', 'Chief Human Resources Officer', 'CHRO', 'VP Human Resources', 'VP HR'] },
  'chro': { fr_m: 'Directeur des Ressources Humaines', fr_f: 'Directrice des Ressources Humaines', en: ['Chief Human Resources Officer', 'HR Director', 'Head of HR', 'VP Human Resources'] },
  'daf': { fr_m: 'Directeur Administratif et Financier', fr_f: 'Directrice Administrative et Financière', en: ['CFO', 'Chief Financial Officer', 'Finance Director', 'Head of Finance', 'VP Finance'] },
  'cfo': { fr_m: 'Directeur Financier', fr_f: 'Directrice Financière', en: ['Chief Financial Officer', 'Finance Director', 'Head of Finance', 'VP Finance'] },
  'dg': { fr_m: 'Directeur Général', fr_f: 'Directrice Générale', en: ['CEO', 'Chief Executive Officer', 'General Manager', 'Managing Director'] },
  'pdg': { fr_m: 'Président-Directeur Général', fr_f: 'Présidente-Directrice Générale', en: ['CEO', 'Chief Executive Officer', 'Chairman & CEO'] },
  'ceo': { fr_m: 'Directeur Général', fr_f: 'Directrice Générale', en: ['Chief Executive Officer', 'Managing Director', 'General Manager'] },
  'cmo': { fr_m: 'Directeur Marketing', fr_f: 'Directrice Marketing', en: ['Chief Marketing Officer', 'Marketing Director', 'Head of Marketing', 'VP Marketing'] },
  'cto': { fr_m: 'Directeur Technique', fr_f: 'Directrice Technique', en: ['Chief Technology Officer', 'Head of Engineering', 'VP Engineering', 'Technical Director'] },
  'coo': { fr_m: 'Directeur des Opérations', fr_f: 'Directrice des Opérations', en: ['Chief Operating Officer', 'Head of Operations', 'VP Operations', 'Operations Director'] },
  'cio': { fr_m: "Directeur des Systèmes d'Information", fr_f: "Directrice des Systèmes d'Information", en: ['Chief Information Officer', 'IT Director', 'Head of IT', 'VP IT'] },
  'dsi': { fr_m: "Directeur des Systèmes d'Information", fr_f: "Directrice des Systèmes d'Information", en: ['CIO', 'Chief Information Officer', 'IT Director', 'Head of IT'] },
  'dco': { fr_m: 'Directeur Commercial', fr_f: 'Directrice Commerciale', en: ['Sales Director', 'Head of Sales', 'VP Sales', 'Chief Revenue Officer', 'CRO'] },
  'cro': { fr_m: 'Directeur Commercial', fr_f: 'Directrice Commerciale', en: ['Chief Revenue Officer', 'Sales Director', 'Head of Sales', 'VP Sales'] },
  'rh': { fr_m: 'Responsable Ressources Humaines', fr_f: 'Responsable Ressources Humaines', en: ['HR Manager', 'Human Resources Manager', 'HR Business Partner'] },
  'dpo': { fr_m: 'Délégué à la Protection des Données', fr_f: 'Déléguée à la Protection des Données', en: ['Data Protection Officer', 'DPO', 'Privacy Officer'] },
  'cpo': { fr_m: 'Directeur Produit', fr_f: 'Directrice Produit', en: ['Chief Product Officer', 'Head of Product', 'VP Product'] },
  'cso': { fr_m: 'Directeur de la Stratégie', fr_f: 'Directrice de la Stratégie', en: ['Chief Strategy Officer', 'Head of Strategy', 'VP Strategy'] },
};

// Patterns de titres FR avec genre masculin/féminin (explicit string mapping)
const GENDER_PATTERNS: { masc: string; fem: string }[] = [
  { masc: 'Directeur', fem: 'Directrice' },
  { masc: 'Président', fem: 'Présidente' },
  { masc: 'Responsable', fem: 'Responsable' }, // invariable
  { masc: 'Chef', fem: 'Cheffe' },
  { masc: 'Manager', fem: 'Manager' }, // invariable
  { masc: 'Coordinateur', fem: 'Coordinatrice' },
  { masc: 'Consultant', fem: 'Consultante' },
  { masc: 'Analyste', fem: 'Analyste' }, // invariable
  { masc: 'Ingénieur', fem: 'Ingénieure' },
  { masc: 'Chargé', fem: 'Chargée' },
  { masc: 'Assistant', fem: 'Assistante' },
  { masc: 'Adjoint', fem: 'Adjointe' },
  { masc: 'Attaché', fem: 'Attachée' },
  { masc: 'Délégué', fem: 'Déléguée' },
  { masc: 'Administrateur', fem: 'Administratrice' },
];

// FR ↔ EN translation pairs pour des termes courants
const TRANSLATION_MAP: { fr: string; en: string }[] = [
  { fr: 'Directeur Marketing', en: 'Marketing Director' },
  { fr: 'Directeur Commercial', en: 'Sales Director' },
  { fr: 'Directeur Financier', en: 'Finance Director' },
  { fr: 'Directeur Technique', en: 'Technical Director' },
  { fr: 'Directeur des Opérations', en: 'Operations Director' },
  { fr: 'Directeur des Ressources Humaines', en: 'HR Director' },
  { fr: "Directeur des Systèmes d'Information", en: 'IT Director' },
  { fr: 'Directeur Général', en: 'General Manager' },
  { fr: 'Directeur de la Communication', en: 'Communications Director' },
  { fr: 'Directeur Juridique', en: 'Legal Director' },
  { fr: 'Directeur Achats', en: 'Procurement Director' },
  { fr: 'Directeur Supply Chain', en: 'Supply Chain Director' },
  { fr: 'Directeur Qualité', en: 'Quality Director' },
  { fr: 'Directeur Logistique', en: 'Logistics Director' },
  { fr: 'Directeur Produit', en: 'Product Director' },
  { fr: 'Responsable Marketing', en: 'Marketing Manager' },
  { fr: 'Responsable Commercial', en: 'Sales Manager' },
  { fr: 'Responsable Ressources Humaines', en: 'HR Manager' },
  { fr: 'Responsable Financier', en: 'Finance Manager' },
  { fr: 'Responsable Communication', en: 'Communications Manager' },
  { fr: 'Responsable Achats', en: 'Procurement Manager' },
  { fr: 'Responsable Qualité', en: 'Quality Manager' },
  { fr: 'Responsable Logistique', en: 'Logistics Manager' },
  { fr: 'Chef de Projet', en: 'Project Manager' },
  { fr: 'Chef de Produit', en: 'Product Manager' },
  { fr: 'Ingénieur Commercial', en: 'Sales Engineer' },
];

// Common "Head of" / "VP" patterns
const SENIORITY_VARIANTS = [
  { pattern: /\bDirector\b/i, variants: ['Head of', 'VP', 'Vice President'] },
  { pattern: /\bHead of\b/i, variants: ['Director', 'VP', 'Vice President'] },
  { pattern: /\bVP\b/i, variants: ['Vice President', 'Director', 'Head of'] },
  { pattern: /\bManager\b/i, variants: ['Lead', 'Head of', 'Responsable'] },
];

function generateGenderVariant(title: string): string | null {
  let femTitle = title;
  let changed = false;
  for (const { masc, fem } of GENDER_PATTERNS) {
    const newTitle = femTitle.replace(masc, fem);
    if (newTitle !== femTitle) {
      femTitle = newTitle;
      changed = true;
    }
  }
  // Also handle adjective agreements
  if (changed) {
    femTitle = femTitle
      .replace(/\bAdministratif\b/g, 'Administrative')
      .replace(/\bFinancier\b/g, 'Financière');
  }
  return changed && femTitle !== title ? femTitle : null;
}

function findTranslation(title: string): string[] {
  const normalized = normalizeForSearch(title);
  const results: string[] = [];

  for (const { fr, en } of TRANSLATION_MAP) {
    if (normalizeForSearch(fr) === normalized) {
      results.push(en);
    }
    if (normalizeForSearch(en) === normalized) {
      results.push(fr);
    }
  }
  return results;
}

/**
 * Génère toutes les variantes possibles d'un terme saisi
 */
export const generateVariants = (input: string): string[] => {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const normalized = normalizeForSearch(trimmed);
  const variants = new Set<string>();

  // Always include the original input
  variants.add(trimmed);

  // 1. Check acronym map
  const acronymEntry = ACRONYM_MAP[normalized];
  if (acronymEntry) {
    variants.add(acronymEntry.fr_m);
    variants.add(acronymEntry.fr_f);
    acronymEntry.en.forEach(v => variants.add(v));
    // Add the uppercase acronym itself
    variants.add(trimmed.toUpperCase());
  }

  // 2. Check if input matches a full title that has an acronym
  for (const [acronym, entry] of Object.entries(ACRONYM_MAP)) {
    const allForms = [entry.fr_m, entry.fr_f, ...entry.en];
    if (allForms.some(f => normalizeForSearch(f) === normalized)) {
      variants.add(acronym.toUpperCase());
      variants.add(entry.fr_m);
      variants.add(entry.fr_f);
      entry.en.forEach(v => variants.add(v));
    }
  }

  // 3. Gender variants
  const femVariant = generateGenderVariant(trimmed);
  if (femVariant) {
    variants.add(femVariant);
  }
  // Also try generating masculine from feminine (reverse)
  for (const { masc, fem } of GENDER_PATTERNS) {
    // Extract the masculine word from the regex pattern cleanly
    const mascWord = masc.source.replace(/\\b/g, '');
    if (fem === mascWord) continue; // Skip invariable forms
    if (trimmed.includes(fem)) {
      const mascTitle = trimmed.replace(new RegExp(`\\b${fem}\\b`, 'g'), mascWord);
      if (mascTitle !== trimmed) {
        const genderVar = generateGenderVariant(mascTitle);
        if (genderVar) variants.add(genderVar);
        variants.add(mascTitle);
      }
    }
  }

  // 4. Translations FR ↔ EN
  const translations = findTranslation(trimmed);
  translations.forEach(t => variants.add(t));
  // Also generate gender variants of translations
  translations.forEach(t => {
    const gv = generateGenderVariant(t);
    if (gv) variants.add(gv);
  });

  // 5. Seniority variants for EN titles
  for (const { pattern, variants: seniorityVars } of SENIORITY_VARIANTS) {
    if (pattern.test(trimmed)) {
      const domain = trimmed.replace(pattern, '').trim();
      for (const sv of seniorityVars) {
        variants.add(`${sv} ${domain}`.trim());
      }
    }
  }

  // Remove the original if it's the only one (no point showing just the input)
  const result = Array.from(variants);
  return result;
};
