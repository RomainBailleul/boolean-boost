import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useJobTitleSuggestions } from '@/hooks/useJobTitleSuggestions';
import { generateVariants } from '@/utils/variantGenerator';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';

interface StepSelectProps {
  mode: 'free' | 'category';
  inputValue: string;
  selectedCategory: string;
  selectedTitles: string[];
  setSelectedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  customTitles: string[];
  setCustomTitles: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
  onBack: () => void;
}

const StepSelect: React.FC<StepSelectProps> = ({
  mode, inputValue, selectedCategory,
  selectedTitles, setSelectedTitles,
  customTitles, setCustomTitles,
  onNext, onBack,
}) => {
  const [customInput, setCustomInput] = React.useState('');
  const suggestions = useJobTitleSuggestions(inputValue, enhancedJobTitlesData, 20);
  const autoVariants = useMemo(() => generateVariants(inputValue), [inputValue]);

  const categoryTitles = mode === 'category' && selectedCategory
    ? enhancedJobTitlesData[selectedCategory as keyof typeof enhancedJobTitlesData] || []
    : [];

  const availableTitles = useMemo(() => {
    if (mode === 'category') return categoryTitles;
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of [...autoVariants, ...suggestions]) {
      if (!seen.has(t)) { seen.add(t); result.push(t); }
    }
    return result;
  }, [mode, autoVariants, suggestions, categoryTitles]);

  const prevVariantsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    if (autoVariants.length > 0) {
      setSelectedTitles(prev => {
        // Remove previously auto-added variants that are no longer relevant
        const oldSet = new Set(prevVariantsRef.current);
        const cleaned = prev.filter(t => !oldSet.has(t));
        // Add new auto variants
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

  const selectAll = () => setSelectedTitles([...new Set([...availableTitles, ...customTitles])]);
  const deselectAll = () => setSelectedTitles([]);
  const totalSelected = selectedTitles.length;
  const hasAutoVariants = mode === 'free' && autoVariants.length > 1;

  return (
    <div className="space-y-4 sm:space-y-6">
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
              <Badge
                key={`auto-${title}`}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className="cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 transition-all hover:shadow-sm rounded-lg"
                onClick={() => toggleTitle(title)}
                role="checkbox"
                aria-checked={selectedTitles.includes(title)}
                aria-label={title}
              >
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
          </h3>
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
            {totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={selectAll} className="text-xs rounded-lg h-8">
            Tout sélectionner
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs rounded-lg h-8">
            Tout désélectionner
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto p-1 -m-1">
          {(mode === 'free'
            ? suggestions.filter(t => !autoVariants.includes(t))
            : categoryTitles
          ).map((title) => (
            <Badge
              key={title}
              variant={selectedTitles.includes(title) ? 'default' : 'outline'}
              className="cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 transition-all hover:shadow-sm rounded-lg"
              onClick={() => toggleTitle(title)}
              role="checkbox"
              aria-checked={selectedTitles.includes(title)}
              aria-label={title}
            >
              {title}
            </Badge>
          ))}
          {customTitles.filter(t => !availableTitles.includes(t)).map((title) => (
            <Badge
              key={`custom-${title}`}
              variant={selectedTitles.includes(title) ? 'default' : 'outline'}
              className="cursor-pointer text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-3 transition-all hover:shadow-sm rounded-lg border-dashed"
              onClick={() => toggleTitle(title)}
              role="checkbox"
              aria-checked={selectedTitles.includes(title)}
              aria-label={title}
            >
              {title}
            </Badge>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2 pt-3 mt-3 border-t border-border">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Titre personnalisé..."
            className="flex-1 h-9 text-sm rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          />
          <Button variant="outline" onClick={addCustom} disabled={!customInput.trim()} className="h-9 w-9 p-0 rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="rounded-xl h-11 sm:h-12 px-5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={totalSelected === 0} size="lg" className="glow-button rounded-xl h-11 sm:h-12 px-5 sm:px-8 font-semibold">
          Générer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepSelect;