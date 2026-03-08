import { type Platform } from '@/utils/queryGenerator';

export interface QuickTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  mode: 'free' | 'category';
  inputValue?: string;
  selectedCategory?: string;
  skills?: string[];
  exclusions?: string[];
  platform?: Platform;
  location?: string;
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'dev-lead',
    label: 'Tech Lead / CTO',
    emoji: '💻',
    description: 'Profils tech senior FR/EN',
    mode: 'free',
    inputValue: 'CTO',
    skills: ['SaaS', 'Management'],
    exclusions: ['Intern', 'Stagiaire', 'Junior'],
    platform: 'sales-navigator',
  },
  {
    id: 'marketing-director',
    label: 'Directeur Marketing',
    emoji: '📣',
    description: 'CMO, VP Marketing, Head of…',
    mode: 'free',
    inputValue: 'CMO',
    skills: ['B2B', 'Digital'],
    exclusions: ['Assistant', 'Stagiaire'],
    platform: 'sales-navigator',
  },
  {
    id: 'sales-vp',
    label: 'VP Sales',
    emoji: '🤝',
    description: 'Directeurs commerciaux',
    mode: 'free',
    inputValue: 'VP Sales',
    skills: ['SaaS'],
    exclusions: ['Intern', 'Junior'],
    platform: 'sales-navigator',
  },
  {
    id: 'drh',
    label: 'DRH / CHRO',
    emoji: '👥',
    description: 'RH senior et People',
    mode: 'free',
    inputValue: 'DRH',
    skills: ['Management'],
    exclusions: ['Assistant', 'Stagiaire'],
    platform: 'sales-navigator',
  },
  {
    id: 'cfo-daf',
    label: 'DAF / CFO',
    emoji: '📊',
    description: 'Direction financière',
    mode: 'free',
    inputValue: 'CFO',
    exclusions: ['Junior', 'Stagiaire'],
    platform: 'sales-navigator',
  },
  {
    id: 'product',
    label: 'Head of Product',
    emoji: '🚀',
    description: 'CPO, Product Director',
    mode: 'free',
    inputValue: 'Head of Product',
    skills: ['Product Management'],
    exclusions: ['Intern'],
    platform: 'sales-navigator',
  },
];
