import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepProgressBar from '@/components/StepProgressBar';
import StepInput from '@/components/steps/StepInput';
import StepSelect from '@/components/steps/StepSelect';
import StepResult from '@/components/steps/StepResult';
import { generateBooleanQuery } from '@/utils/queryGenerator';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';
import { Zap } from 'lucide-react';

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
      inputValue,
      selectedCategory,
      selectedTitles,
      customTitles,
    });
  }, [selectedTitles, customTitles, mode, inputValue, selectedCategory]);

  const reset = () => {
    setStep(0);
    setInputValue('');
    setMode('free');
    setSelectedCategory('');
    setSelectedTitles([]);
    setCustomTitles([]);
  };

  return (
    <div className="min-h-screen bg-background dot-grid">
      {/* Hero gradient bar */}
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-hero)' }} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Outil gratuit — +950 titres métiers
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Boolean</span>{' '}
            <span className="text-foreground">Boost</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Générez des requêtes boolean LinkedIn enrichies en{' '}
            <span className="font-semibold text-foreground">3 étapes</span>
          </p>
        </header>

        {/* Progress */}
        <StepProgressBar currentStep={step} steps={STEPS} />

        {/* Steps */}
        <div className="min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <StepInput
                  mode={mode}
                  setMode={setMode}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onNext={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <StepResult
                  booleanQuery={booleanQuery}
                  selectedCount={selectedTitles.length}
                  onBack={() => setStep(1)}
                  onReset={reset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center border-t border-border pt-6 pb-4">
          <p className="text-xs text-muted-foreground">
            Créé par{' '}
            <a
              href="https://la-mine.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              La‑Mine.io
            </a>
            {' '}· Outil 100% gratuit
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BooleanGenerator;