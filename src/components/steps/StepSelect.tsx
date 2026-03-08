import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Auto-generated variants from input
  const autoVariants = useMemo(() => generateVariants(inputValue), [inputValue]);

  // In category mode, show all titles from selected category
  const categoryTitles = mode === 'category' && selectedCategory
    ? enhancedJobTitlesData[selectedCategory as keyof typeof enhancedJobTitlesData] || []
    : [];

  // Merge: auto variants first, then DB suggestions (deduplicated)
  const availableTitles = useMemo(() => {
    if (mode === 'category') return categoryTitles;
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of [...autoVariants, ...suggestions]) {
      if (!seen.has(t)) {
        seen.add(t);
        result.push(t);
      }
    }
    return result;
  }, [mode, autoVariants, suggestions, categoryTitles]);

  // Auto-select generated variants on first render
  const prevInputRef = React.useRef('');
  React.useEffect(() => {
    if (inputValue !== prevInputRef.current && autoVariants.length > 0) {
      prevInputRef.current = inputValue;
      // Pre-select auto-generated variants
      setSelectedTitles(prev => {
        const newSet = new Set(prev);
        autoVariants.forEach(v => newSet.add(v));
        return Array.from(newSet);
      });
    }
  }, [inputValue, autoVariants, setSelectedTitles]);

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

  const selectAll = () => {
    const all = [...new Set([...availableTitles, ...customTitles])];
    setSelectedTitles(all);
  };

  const deselectAll = () => setSelectedTitles([]);

  const totalSelected = selectedTitles.length;
  const hasAutoVariants = mode === 'free' && autoVariants.length > 1;

  return (
    <div className="space-y-6">
      {/* Auto-generated variants section */}
      {hasAutoVariants && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Variantes générées automatiquement
              <Badge variant="secondary" className="text-xs ml-auto">
                {autoVariants.length} variantes
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              FR/EN, genre, acronymes — cliquez pour ajouter/retirer
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {autoVariants.map((title) => (
                <Badge
                  key={`auto-${title}`}
                  variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3 transition-all hover:shadow-sm"
                  onClick={() => toggleTitle(title)}
                >
                  {title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DB suggestions / category titles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {mode === 'free' ? 'Suggestions de la base' : 'Titres de la catégorie'}
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Tout désélectionner
            </Button>
          </div>

          {/* Available titles (exclude auto variants in free mode to avoid duplication) */}
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1">
            {(mode === 'free'
              ? suggestions.filter(t => !autoVariants.includes(t))
              : categoryTitles
            ).map((title) => (
              <Badge
                key={title}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 transition-all hover:shadow-sm"
                onClick={() => toggleTitle(title)}
              >
                {title}
              </Badge>
            ))}
            {customTitles.filter(t => !availableTitles.includes(t)).map((title) => (
              <Badge
                key={`custom-${title}`}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 transition-all hover:shadow-sm border-dashed"
                onClick={() => toggleTitle(title)}
              >
                {title}
              </Badge>
            ))}
          </div>

          {/* Add custom title */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ajouter un titre personnalisé..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <Button variant="outline" onClick={addCustom} disabled={!customInput.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={totalSelected === 0} size="lg">
          Générer la requête
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepSelect;
