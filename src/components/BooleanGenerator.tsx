import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import StepProgressBar from '@/components/StepProgressBar';
import StepInput from '@/components/steps/StepInput';
import type { NlpResult } from '@/components/steps/StepInput';
import StepSelect from '@/components/steps/StepSelect';
import StepResult from '@/components/steps/StepResult';
import ThemeToggle from '@/components/ThemeToggle';
import AuthModal from '@/components/AuthModal';
import { generateBooleanQuery, type Platform } from '@/utils/queryGenerator';
import { QUICK_TEMPLATES, type QuickTemplate } from '@/data/quickTemplates';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { trackQueryGenerated } from '@/hooks/useUsageTracking';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';
import { Zap, Rocket, User, LogOut, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export type Seniority = '' | 'junior' | 'mid' | 'senior' | 'vp' | 'c-level' | 'director';

const STEPS = [
  { label: 'Recherche', description: 'Saisissez un poste' },
  { label: 'Sélection', description: 'Choisissez les variantes' },
  { label: 'Résultat', description: 'Copiez la requête' },
];

const BooleanGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'free' | 'category'>('free');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform>('sales-navigator');
  const [location, setLocation] = useState('');
  const [seniority, setSeniority] = useState<Seniority>('');

  // Ref for copy action in shortcuts
  const copyRef = useRef<(() => void) | null>(null);

  // P0-01: Community query count
  const [communityCount, setCommunityCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('query-count');
        if (!error && data?.count != null) setCommunityCount(data.count);
      } catch {}
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setStep(2);
    const loc = searchParams.get('loc');
    if (loc) setLocation(loc);
    const p = searchParams.get('p') as Platform | null;
    if (p && ['linkedin', 'sales-navigator', 'google-xray'].includes(p)) setPlatform(p);
    // Auto-open auth modal if redirected from protected route
    if (searchParams.get('auth') === 'required') {
      setAuthOpen(true);
      searchParams.delete('auth');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const booleanQuery = useMemo(() => {
    const sharedQuery = searchParams.get('q');
    if (sharedQuery && step === 2 && selectedTitles.length === 0) return sharedQuery;
    return generateBooleanQuery(enhancedJobTitlesData, {
      mode, inputValue, selectedCategory: selectedCategories[0] || '',
      selectedCategories,
      selectedTitles, customTitles,
      exclusions, skills, platform, location,
    });
  }, [selectedTitles, customTitles, mode, inputValue, selectedCategories, exclusions, skills, platform, location, searchParams, step]);

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
    setSelectedCategories(template.selectedCategory ? [template.selectedCategory] : []);
    setSkills(template.skills || []);
    setExclusions(template.exclusions || []);
    setPlatform(template.platform || 'sales-navigator');
    setLocation(template.location || '');
    setSelectedTitles([]);
    setCustomTitles([]);
    setSeniority('');
    setStep(1);
  }, []);

  const handleNlpResult = useCallback((result: NlpResult) => {
    if (result.location) setLocation(result.location);
    if (result.seniority) setSeniority(result.seniority as Seniority);
    if (result.skills?.length) setSkills(result.skills);
    if (result.exclusions?.length) setExclusions(result.exclusions);
  }, []);

  const reset = () => {
    setStep(0);
    setInputValue('');
    setMode('free');
    setSelectedCategories([]);
    setSelectedTitles([]);
    setCustomTitles([]);
    setExclusions([]);
    setSkills([]);
    setPlatform('sales-navigator');
    setLocation('');
    setSeniority('');
    setSearchParams({});
  };

  // Keyboard shortcuts
  const handleShortcutNext = useCallback(() => {
    if (step === 0) {
      const canProceed = mode === 'free' ? inputValue.trim().length > 0 : selectedCategories.length > 0;
      if (canProceed) setStep(1);
    } else if (step === 1 && selectedTitles.length > 0) {
      setStep(2);
    }
  }, [step, mode, inputValue, selectedCategories, selectedTitles]);

  const handleShortcutBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleShortcutCopy = useCallback(() => {
    if (step === 2 && copyRef.current) copyRef.current();
  }, [step]);

  useKeyboardShortcuts({
    onNext: handleShortcutNext,
    onBack: handleShortcutBack,
    onCopy: handleShortcutCopy,
  });

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-hero)' }} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl">
        <header className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg text-xs gap-1.5">
              <Link to="/dashboard"><BarChart3 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Stats</span></Link>
            </Button>
            {user ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={signOut} className="h-8 rounded-lg text-xs gap-1.5">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Déconnexion</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)} className="h-8 rounded-lg text-xs gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connexion</span>
              </Button>
            )}
            <ThemeToggle />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Zap className="w-3.5 h-3.5" />
            Outil gratuit — +950 titres métiers
          </div>
          {communityCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-4"
            >
              <Users className="w-3 h-3" />
              <span>
                <motion.span
                  key={communityCount}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-semibold text-foreground"
                >
                  {communityCount.toLocaleString('fr-FR')}
                </motion.span>
                {' '}requêtes générées par la communauté
              </span>
            </motion.div>
          )}
          {communityCount === 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Rejoignez les premiers utilisateurs 🚀
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Boolean</span>{' '}
            <span className="text-foreground">Boost</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Générez des requêtes boolean LinkedIn enrichies en{' '}
            <span className="font-semibold text-foreground">3 étapes</span>
          </p>
        </header>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Démarrage rapide</h2>
            </div>
            <div id="coachmark-templates" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TEMPLATES.map((tpl) => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                  className="glass-card rounded-lg border p-3 text-left transition-all hover:border-primary/40 hover:shadow-md group">
                  <span className="text-lg">{tpl.emoji}</span>
                  <div className="font-semibold text-card-foreground text-xs sm:text-sm mt-1 leading-tight group-hover:text-primary transition-colors">{tpl.label}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{tpl.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <StepProgressBar currentStep={step} steps={STEPS} />

        <div className="min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                <StepInput mode={mode} setMode={setMode} inputValue={inputValue}
                  setInputValue={setInputValue} selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories} onNext={() => setStep(1)}
                  onNlpResult={handleNlpResult} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                <StepSelect mode={mode} inputValue={inputValue} selectedCategories={selectedCategories}
                  selectedTitles={selectedTitles} setSelectedTitles={setSelectedTitles}
                  customTitles={customTitles} setCustomTitles={setCustomTitles}
                  exclusions={exclusions} setExclusions={setExclusions}
                  skills={skills} setSkills={setSkills}
                  seniority={seniority} setSeniority={setSeniority}
                  platform={platform} location={location}
                  onNext={() => {
                    setStep(2);
                    trackQueryGenerated({
                      categories: selectedCategories,
                      platform,
                      location,
                      titlesCount: selectedTitles.length,
                      mode,
                    });
                  }} onBack={() => setStep(0)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                <StepResult booleanQuery={booleanQuery} selectedCount={selectedTitles.length}
                  platform={platform} setPlatform={setPlatform}
                  location={location} setLocation={setLocation}
                  shareUrl={shareUrl} onBack={() => setStep(1)} onReset={reset}
                  user={user} copyRef={copyRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-12 sm:mt-16 text-center border-t border-border pt-6 pb-4">
          <p className="text-xs text-muted-foreground">
            Créé par{' '}
            <a href="https://la-mine.io" target="_blank" rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline underline-offset-2">La‑Mine.io</a>
            {' '}· Outil 100% gratuit
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
            ⌘+Enter suivant · Esc retour · ⌘+C copier
          </p>
        </footer>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default BooleanGenerator;
