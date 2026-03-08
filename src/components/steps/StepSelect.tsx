import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Plus, Sparkles, ShieldMinus, Target, UserCheck } from 'lucide-react';
import { useJobTitleSuggestions } from '@/hooks/useJobTitleSuggestions';
import { generateVariants } from '@/utils/variantGenerator';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';
import type { Seniority } from '@/components/BooleanGenerator';

const SENIORITY_OPTIONS: { value: Seniority; label: string; emoji: string }[] = [
  { value: '', label: 'Tous', emoji: '🔄' },
  { value: 'junior', label: 'Junior', emoji: '🌱' },
  { value: 'mid', label: 'Mid-level', emoji: '📈' },
  { value: 'senior', label: 'Senior', emoji: '⭐' },
  { value: 'director', label: 'Director', emoji: '🎯' },
  { value: 'vp', label: 'VP', emoji: '🏅' },
  { value: 'c-level', label: 'C-Level', emoji: '👑' },
];

interface StepSelectProps {
  mode: 'free' | 'category';
  inputValue: string;
  selectedCategory: string;
  selectedTitles: string[];
  setSelectedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  customTitles: string[];
  setCustomTitles: React.Dispatch<React.SetStateAction<string[]>>;
  exclusions: string[];
  setExclusions: React.Dispatch<React.SetStateAction<string[]>>;
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  seniority: Seniority;
  setSeniority: (s: Seniority) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepSelect: React.FC<StepSelectProps> = ({
  mode, inputValue, selectedCategory,
  selectedTitles, setSelectedTitles,
  customTitles, setCustomTitles,
  exclusions, setExclusions,
  skills, setSkills,
  seniority, setSeniority,
  onNext, onBack,
}) => {
  const [customInput, setCustomInput] = React.useState('');
  const [exclusionInput, setExclusionInput] = React.useState('');
  const [skillInput, setSkillInput] = React.useState('');
  const suggestions = useJobTitleSuggestions(inputValue, enhancedJobTitlesData, 20);
  const autoVariants = useMemo(() => generateVariants(inputValue), [inputValue]);

  const categoryTitles = mode === 'category' && selectedCategory
    ? enhancedJobTitlesData[selectedCategory as keyof typeof enhancedJobTitlesData] || []
    : [];

  // Filter by seniority
  const seniorityFilter = useMemo(() => {
    if (!seniority) return null;
    const patterns: Record<string, RegExp> = {
      junior: /\b(junior|jr\.?|entry|débutant)\b/i,
      mid: /\b(mid|intermédiaire|confirmé)\b/i,
      senior: /\b(senior|sr\.?|expérimenté|principal)\b/i,
      director: /\b(director|directeur|directrice|head\s+of)\b/i,
      vp: /\b(vp|vice[- ]?president|vice[- ]?président)\b/i,
      'c-level': /\b(chief|c[A-Z]o\b|ceo|cto|cfo|cmo|coo|cpo|chro|cdo|cio)\b/i,
    };
    return patterns[seniority] || null;
  }, [seniority]);

  const filterBySeniority = (titles: string[]) => {
    if (!seniorityFilter) return titles;
    return titles.filter(t => seniorityFilter.test(t));
  };

  const availableTitles = useMemo(() => {
    let base: string[];
    if (mode === 'category') {
      base = categoryTitles;
    } else {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const t of [...autoVariants, ...suggestions]) {
        if (!seen.has(t)) { seen.add(t); result.push(t); }
      }
      base = result;
    }
    return filterBySeniority(base);
  }, [mode, autoVariants, suggestions, categoryTitles, seniorityFilter]);

  const prevVariantsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    if (autoVariants.length > 0) {
      setSelectedTitles(prev => {
        const oldSet = new Set(prevVariantsRef.current);
        const cleaned = prev.filter(t => !oldSet.has(t));
        const newSet = new Set(cleaned);
        autoVariants.forEach(v => newSet.add(v));
        return Array.from(newSet);
      });
      prevVariantsRef.current = autoVariants;
    }
  }, [autoVariants, setSelectedTitles]);

  const toggleTitle = (title: string) => {
    setSelectedTitles(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customTitles.includes(trimmed)) {
      setCustomTitles(prev => [...prev, trimmed]);
      setSelectedTitles(prev => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const addExclusion = () => {
    const trimmed = exclusionInput.trim();
    if (trimmed && !exclusions.includes(trimmed)) {
      setExclusions(prev => [...prev, trimmed]);
      setExclusionInput('');
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const selectAll = () => setSelectedTitles([...new Set([...availableTitles, ...customTitles])]);
  const deselectAll = () => setSelectedTitles([]);
  const totalSelected = selectedTitles.length;
  const hasAutoVariants = mode === 'free' && autoVariants.length > 1;

  const filteredSuggestions = filterBySeniority(
    mode === 'free' ? suggestions.filter(t => !autoVariants.includes(t)) : categoryTitles
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Seniority filter */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-primary" />
          Niveau de séniorité
        </h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSeniority(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                seniority === opt.value
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/25'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30'
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-generated variants */}
      {hasAutoVariants && (
        <div className="glass-card rounded-xl p-4 sm:p-5 border-primary/20 bg-primary/3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Variantes auto-générées
            </h3>
            <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {autoVariants.length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            FR/EN · genre · acronymes — cliquez pour retirer
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {autoVariants.map((title) => (
            <Badge key={`auto-${title}`}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  selectedTitles.includes(title)
                    ? 'hover:scale-105 active:scale-95'
                    : 'hover:scale-105 active:scale-95 hover:border-primary/40'
                }`}
                onClick={() => toggleTitle(title)} role="checkbox"
                aria-checked={selectedTitles.includes(title)} aria-label={title}>
                {title}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* DB suggestions / category titles */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            {mode === 'free' ? 'Suggestions' : 'Titres'}
            {seniority && <span className="text-xs text-muted-foreground ml-2">(filtrés: {seniority})</span>}
          </h3>
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
            {totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={selectAll} className="text-xs rounded-lg h-8">Tout sélectionner</Button>
          <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs rounded-lg h-8">Tout désélectionner</Button>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto p-1 -m-1">
          {filteredSuggestions.map((title) => (
            <Badge key={title} variant={selectedTitles.includes(title) ? 'default' : 'outline'}
              className={`cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg transition-all duration-200 hover:shadow-sm ${
                selectedTitles.includes(title)
                  ? 'hover:scale-105 active:scale-95'
                  : 'hover:scale-105 active:scale-95 hover:border-primary/40'
              }`}
              onClick={() => toggleTitle(title)} role="checkbox"
              aria-checked={selectedTitles.includes(title)} aria-label={title}>
              {title}
            </Badge>
          ))}
          {customTitles.filter(t => !availableTitles.includes(t)).map((title) => (
            <Badge key={`custom-${title}`} variant={selectedTitles.includes(title) ? 'default' : 'outline'}
              className={`cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg border-dashed transition-all duration-200 hover:shadow-sm ${
                selectedTitles.includes(title)
                  ? 'hover:scale-105 active:scale-95'
                  : 'hover:scale-105 active:scale-95 hover:border-primary/40'
              }`}
              onClick={() => toggleTitle(title)} role="checkbox"
              aria-checked={selectedTitles.includes(title)} aria-label={title}>
              {title}
            </Badge>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2 pt-3 mt-3 border-t border-border">
          <Input value={customInput} onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Titre personnalisé..." className="flex-1 h-9 text-sm rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
          <Button variant="outline" onClick={addCustom} disabled={!customInput.trim()} className="h-9 w-9 p-0 rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Skills AND */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-accent" />
          Compétences requises (AND)
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">Ajoutez des mots-clés obligatoires pour affiner la recherche</p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skills.map((skill) => (
              <Badge key={`skill-${skill}`} variant="default"
                className="cursor-pointer text-xs py-1 px-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80"
                onClick={() => setSkills(prev => prev.filter(s => s !== skill))} aria-label={`Retirer ${skill}`}>
                {skill} ×
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Ex: SaaS, Management, B2B..." className="flex-1 h-9 text-sm rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
          <Button variant="outline" onClick={addSkill} disabled={!skillInput.trim()} className="h-9 w-9 p-0 rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Exclusions NOT */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <ShieldMinus className="w-4 h-4 text-destructive" />
          Exclusions (NOT)
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">Termes à exclure des résultats</p>
        {exclusions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {exclusions.map((exc) => (
              <Badge key={`exc-${exc}`} variant="outline"
                className="cursor-pointer text-xs py-1 px-2.5 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setExclusions(prev => prev.filter(e => e !== exc))} aria-label={`Retirer ${exc}`}>
                {exc} ×
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)}
            placeholder="Ex: Intern, Stagiaire, Junior..." className="flex-1 h-9 text-sm rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && addExclusion()} />
          <Button variant="outline" onClick={addExclusion} disabled={!exclusionInput.trim()} className="h-9 w-9 p-0 rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="rounded-xl h-11 sm:h-12 px-5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={onNext} disabled={totalSelected === 0} size="lg" className="glow-button rounded-xl h-11 sm:h-12 px-5 sm:px-8 font-semibold">
          Générer <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepSelect;
