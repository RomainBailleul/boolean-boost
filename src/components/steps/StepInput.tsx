import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, ArrowRight } from 'lucide-react';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';

interface StepInputProps {
  mode: 'free' | 'category';
  setMode: (mode: 'free' | 'category') => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNext: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  marketing: '📣', sales: '🤝', tech: '💻', finance: '📊',
  hr: '👥', operations: '⚙️', leadership: '🏆', juridique: '⚖️',
  qualite: '✅', achats: '🛒', supply_chain: '🔗', logistique: '🚛', immobilier: '🏢',
};

const StepInput: React.FC<StepInputProps> = ({
  mode, setMode, inputValue, setInputValue,
  selectedCategory, setSelectedCategory, onNext,
}) => {
  const canProceed = mode === 'free' ? inputValue.trim().length > 0 : selectedCategory.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={() => setMode('free')}
          aria-pressed={mode === 'free'}
          className={`glass-card rounded-xl p-3 sm:p-4 text-center transition-all ${
            mode === 'free'
              ? 'ring-2 ring-primary border-primary/40'
              : 'hover:border-primary/30'
          }`}
        >
          <Search className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'free' ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-semibold ${mode === 'free' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Recherche libre
          </span>
        </button>
        <button
          onClick={() => setMode('category')}
          className={`glass-card rounded-xl p-3 sm:p-4 text-center transition-all ${
            mode === 'category'
              ? 'ring-2 ring-primary border-primary/40'
              : 'hover:border-primary/30'
          }`}
        >
          <Briefcase className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'category' ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-semibold ${mode === 'category' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Par métier
          </span>
        </button>
      </div>

      {mode === 'free' ? (
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-1">
            Quel poste recherchez-vous ?
          </h2>
          <Label htmlFor="job-input" className="text-xs text-muted-foreground">
            Intitulé, acronyme ou mot-clé
          </Label>
          <Input
            id="job-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ex: CMO, DRH, Head of Sales..."
            className="mt-3 text-base h-12 sm:h-14 rounded-lg border-border bg-background/80 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && canProceed && onNext()}
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Les variantes FR/EN, genres et acronymes seront générés automatiquement
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-3">
            Choisissez une famille métier
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {Object.keys(enhancedJobTitlesData).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg border p-3 sm:p-4 text-left transition-all hover:shadow-md ${
                  selectedCategory === category
                    ? 'border-primary bg-primary/8 ring-2 ring-primary/25 shadow-md'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="text-lg sm:text-xl">{CATEGORY_ICONS[category] || '📁'}</span>
                <div className="font-semibold capitalize text-card-foreground text-xs sm:text-sm mt-1 leading-tight">
                  {category.replace('_', ' ')}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {enhancedJobTitlesData[category as keyof typeof enhancedJobTitlesData].length} titres
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="glow-button rounded-xl h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold"
        >
          Suivant
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepInput;