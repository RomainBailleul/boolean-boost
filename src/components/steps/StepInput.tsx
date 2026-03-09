import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Briefcase, ArrowRight, Wand2, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';

export interface NlpResult {
  jobTitle: string;
  location: string;
  seniority: string;
  skills: string[];
  exclusions: string[];
}

interface StepInputProps {
  mode: 'free' | 'category';
  setMode: (mode: 'free' | 'category') => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  onNext: () => void;
  onNlpResult?: (result: NlpResult) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  marketing: '📣', sales: '🤝', tech: '💻', finance: '📊',
  hr: '👥', operations: '⚙️', leadership: '🏆', juridique: '⚖️',
  qualite: '✅', achats: '🛒', supply_chain: '🔗', logistique: '🚛', immobilier: '🏢',
};

const StepInput: React.FC<StepInputProps> = ({
  mode, setMode, inputValue, setInputValue,
  selectedCategories, setSelectedCategories, onNext, onNlpResult,
}) => {
  const [nlpInput, setNlpInput] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const { toast } = useToast();

  const canProceed = mode === 'free' ? inputValue.trim().length > 0 : selectedCategories.length > 0;

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const handleNlp = async () => {
    if (!nlpInput.trim()) return;
    setNlpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-natural-query', {
        body: { text: nlpInput.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'Erreur IA', description: data.error, variant: 'destructive' });
        return;
      }
      if (data.jobTitle) {
        setInputValue(data.jobTitle);
        setMode('free');
      }
      if (onNlpResult) {
        onNlpResult(data as NlpResult);
      }
      toast({ title: '✨ Analyse terminée', description: `Poste détecté : ${data.jobTitle || 'non identifié'}` });
      if (data.jobTitle) {
        setTimeout(() => onNext(), 300);
      }
    } catch (e) {
      console.error('NLP error:', e);
      toast({ title: 'Erreur', description: "Impossible d'analyser la requête.", variant: 'destructive' });
    } finally {
      setNlpLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* NLP natural language input */}
      <div id="coachmark-nlp" className="glass-card rounded-xl p-4 sm:p-5 border-accent/20">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Recherche intelligente (IA)</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Décrivez votre profil idéal en langage naturel
        </p>
        <Textarea
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          placeholder="Ex: Je cherche un directeur marketing senior à Paris, spécialisé en SaaS B2B, pas de stagiaire ni junior"
          className="text-sm min-h-[60px] rounded-lg resize-none bg-background/80"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleNlp())}
        />
        <Button
          onClick={handleNlp}
          disabled={!nlpInput.trim() || nlpLoading}
          className="mt-3 w-full glow-button rounded-lg h-10 text-sm font-semibold"
        >
          {nlpLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Analyser avec l'IA
            </>
          )}
        </Button>

        {nlpLoading && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Extraction des critères…
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">ou recherche manuelle</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Mode toggle */}
      <div id="coachmark-mode" className="grid grid-cols-2 gap-2 sm:gap-3">
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
          aria-pressed={mode === 'category'}
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
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-1">
            Choisissez une ou plusieurs familles métier
          </h2>
          <p className="text-[11px] text-muted-foreground mb-3">
            Combinez plusieurs catégories pour élargir la recherche
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {Object.keys(enhancedJobTitlesData).map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  aria-pressed={isSelected}
                  aria-label={`Catégorie ${category.replace('_', ' ')}`}
                  className={`rounded-lg border p-3 sm:p-4 text-left transition-all hover:shadow-md relative ${
                    isSelected
                      ? 'border-primary bg-primary/8 ring-2 ring-primary/25 shadow-md'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-lg sm:text-xl">{CATEGORY_ICONS[category] || '📁'}</span>
                  <div className="font-semibold capitalize text-card-foreground text-xs sm:text-sm mt-1 leading-tight">
                    {category.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {enhancedJobTitlesData[category as keyof typeof enhancedJobTitlesData].length} titres
                  </div>
                </button>
              );
            })}
          </div>
          {selectedCategories.length > 0 && (
            <p className="text-xs text-primary font-medium mt-3">
              {selectedCategories.length} catégorie{selectedCategories.length > 1 ? 's' : ''} sélectionnée{selectedCategories.length > 1 ? 's' : ''}
            </p>
          )}
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
