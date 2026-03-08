import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import StepProgressBar from '@/components/StepProgressBar';
import StepInput from '@/components/steps/StepInput';
import StepSelect from '@/components/steps/StepSelect';
import StepResult from '@/components/steps/StepResult';
import ThemeToggle from '@/components/ThemeToggle';
import { generateBooleanQuery, type Platform } from '@/utils/queryGenerator';
import { QUICK_TEMPLATES, type QuickTemplate } from '@/data/quickTemplates';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';
import { Zap, Rocket } from 'lucide-react';

const STEPS = [
  { label: 'Recherche', description: 'Saisissez un poste' },
  { label: 'Sélection', description: 'Choisissez les variantes' },
  { label: 'Résultat', description: 'Copiez la requête' },
];

const BooleanGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'free' | 'category'>('free');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform>('sales-navigator');
  const [location, setLocation] = useState('');

  // Restore from URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      // We have a shared query — jump to result
      setStep(2);
    }
    const loc = searchParams.get('loc');
    if (loc) setLocation(loc);
    const p = searchParams.get('p') as Platform | null;
    if (p && ['linkedin', 'sales-navigator', 'google-xray'].includes(p)) setPlatform(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const booleanQuery = useMemo(() => {
    // If loaded from shared URL
    const sharedQuery = searchParams.get('q');
    if (sharedQuery && step === 2 && selectedTitles.length === 0) {
      return sharedQuery;
    }
    return generateBooleanQuery(enhancedJobTitlesData, {
      mode,
      inputValue,
      selectedCategory,
      selectedTitles,
      customTitles,
      exclusions,
      skills,
      platform,
      location,
    });
  }, [selectedTitles, customTitles, mode, inputValue, selectedCategory, exclusions, skills, platform, location, searchParams, step]);

  const shareUrl = useMemo(() => {
    if (!booleanQuery) return '';
    const params = new URLSearchParams();
    params.set('q', booleanQuery);
    if (location) params.set('loc', location);
    params.set('p', platform);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [booleanQuery, location, platform]);

  const applyTemplate = useCallback((template: QuickTemplate) => {
    setMode(template.mode);
    setInputValue(template.inputValue || '');
    setSelectedCategory(template.selectedCategory || '');
    setSkills(template.skills || []);
    setExclusions(template.exclusions || []);
    setPlatform(template.platform || 'sales-navigator');
    setLocation(template.location || '');
    setSelectedTitles([]);
    setCustomTitles([]);
    setStep(1);
  }, []);

  const reset = () => {
    setStep(0);
    setInputValue('');
    setMode('free');
    setSelectedCategory('');
    setSelectedTitles([]);
    setCustomTitles([]);
    setExclusions([]);
    setSkills([]);
    setPlatform('sales-navigator');
    setLocation('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-hero)' }} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
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

        {/* Quick Templates — only on step 0 */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Démarrage rapide</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="glass-card rounded-lg border p-3 text-left transition-all hover:border-primary/40 hover:shadow-md group"
                >
                  <span className="text-lg">{tpl.emoji}</span>
                  <div className="font-semibold text-card-foreground text-xs sm:text-sm mt-1 leading-tight group-hover:text-primary transition-colors">
                    {tpl.label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

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
                  exclusions={exclusions}
                  setExclusions={setExclusions}
                  skills={skills}
                  setSkills={setSkills}
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
                  platform={platform}
                  setPlatform={setPlatform}
                  location={location}
                  setLocation={setLocation}
                  shareUrl={shareUrl}
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
