import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COACHMARKS = [
  {
    targetId: 'coachmark-nlp',
    title: '🤖 Recherche intelligente',
    description: "Décrivez votre besoin en langage naturel, l'IA comprend et pré-remplit le formulaire.",
  },
  {
    targetId: 'coachmark-mode',
    title: '🔀 Deux modes de recherche',
    description: 'Choisissez entre recherche libre (saisissez un titre) ou par famille métier (13 catégories).',
  },
  {
    targetId: 'coachmark-templates',
    title: '🚀 Templates pré-configurés',
    description: 'Démarrez en un clic avec un template pré-rempli pour les postes les plus courants.',
  },
];

const STORAGE_KEY = 'bb-onboarding-done';

const Coachmarks: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setCurrentStep(0), 800);
    return () => clearTimeout(timer);
  }, []);

  // Position the tooltip below the target element
  useEffect(() => {
    if (currentStep < 0) return;
    const target = document.getElementById(COACHMARKS[currentStep].targetId);
    if (!target) return;

    const update = () => {
      const rect = target.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    };

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Small delay after scroll
    const t = setTimeout(update, 300);
    window.addEventListener('resize', update);
    return () => { clearTimeout(t); window.removeEventListener('resize', update); };
  }, [currentStep]);

  const dismiss = useCallback(() => {
    setCurrentStep(-1);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  const next = useCallback(() => {
    if (currentStep >= COACHMARKS.length - 1) {
      dismiss();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, dismiss]);

  if (currentStep < 0 || !pos) return null;

  const mark = COACHMARKS[currentStep];

  return (
    <>
      {/* Subtle overlay */}
      <div className="fixed inset-0 bg-background/30 z-40" onClick={dismiss} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 w-72 rounded-xl border border-primary/30 bg-popover text-popover-foreground shadow-xl p-4"
          style={{ top: pos.top, left: Math.max(16, Math.min(pos.left - 144, window.innerWidth - 304)) }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-foreground">{mark.title}</h4>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mark.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {currentStep + 1}/{COACHMARKS.length}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={dismiss} className="h-7 text-xs px-2">
                Passer
              </Button>
              <Button size="sm" onClick={next} className="h-7 text-xs px-3">
                {currentStep >= COACHMARKS.length - 1 ? 'Terminé' : 'Suivant'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Coachmarks;
