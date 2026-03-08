import React, { useState, useMemo } from 'react';
import StepProgressBar from '@/components/StepProgressBar';
import StepInput from '@/components/steps/StepInput';
import StepSelect from '@/components/steps/StepSelect';
import StepResult from '@/components/steps/StepResult';
import { generateBooleanQuery } from '@/utils/queryGenerator';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';

const STEPS = [
  { label: 'Recherche', description: 'Saisissez un poste' },
  { label: 'Sélection', description: 'Choisissez les variantes' },
  { label: 'Résultat', description: 'Copiez la requête' },
];

const BooleanGenerator = () => {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'free' | 'category'>('free');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<string[]>([]);

  const booleanQuery = useMemo(() => {
    return generateBooleanQuery(enhancedJobTitlesData, {
      mode,
      inputValue: '',
      selectedCategory: '',
      selectedTitles,
      customTitles: [],
    });
  }, [selectedTitles, mode]);

  const reset = () => {
    setStep(0);
    setInputValue('');
    setMode('free');
    setSelectedCategory('');
    setSelectedTitles([]);
    setCustomTitles([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Prospection B2B Master
          </h1>
          <p className="text-muted-foreground">
            Générez des requêtes boolean LinkedIn en 3 étapes
          </p>
        </header>

        {/* Progress */}
        <StepProgressBar currentStep={step} steps={STEPS} />

        {/* Steps */}
        {step === 0 && (
          <StepInput
            mode={mode}
            setMode={setMode}
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <StepSelect
            mode={mode}
            inputValue={inputValue}
            selectedCategory={selectedCategory}
            selectedTitles={selectedTitles}
            setSelectedTitles={setSelectedTitles}
            customTitles={customTitles}
            setCustomTitles={setCustomTitles}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepResult
            booleanQuery={booleanQuery}
            selectedCount={selectedTitles.length}
            onBack={() => setStep(1)}
            onReset={reset}
          />
        )}

        {/* Footer */}
        <footer className="mt-16 text-center border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Made by{' '}
            <a
              href="https://la-mine.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              La‑Mine.io
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BooleanGenerator;
