import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const StepInput: React.FC<StepInputProps> = ({
  mode, setMode, inputValue, setInputValue,
  selectedCategory, setSelectedCategory, onNext,
}) => {
  const canProceed = mode === 'free' ? inputValue.trim().length > 0 : selectedCategory.length > 0;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-3">
        <Button
          variant={mode === 'free' ? 'default' : 'outline'}
          onClick={() => setMode('free')}
          className="flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          Recherche libre
        </Button>
        <Button
          variant={mode === 'category' ? 'default' : 'outline'}
          onClick={() => setMode('category')}
          className="flex-1"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Arborescence métier
        </Button>
      </div>

      {mode === 'free' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quel poste recherchez-vous ?</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="job-input" className="text-sm text-muted-foreground">
              Saisissez un intitulé, un acronyme ou un mot-clé
            </Label>
            <Input
              id="job-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: CMO, Directeur Marketing, Head of Sales..."
              className="mt-2 text-base"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && canProceed && onNext()}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choisissez une famille métier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(enhancedJobTitlesData).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                    selectedCategory === category
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-border bg-card hover:border-accent/40'
                  }`}
                >
                  <div className="font-semibold capitalize text-card-foreground">{category}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {enhancedJobTitlesData[category as keyof typeof enhancedJobTitlesData].length} titres
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Suivant
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepInput;
