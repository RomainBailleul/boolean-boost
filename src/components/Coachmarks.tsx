import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COACHMARKS = [
  {
    targetId: 'coachmark-nlp',
    title: '🤖 Recherche intelligente',
    description: 'Décrivez votre besoin en langage naturel, l\'IA comprend et pré-remplit le formulaire.',
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
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Delay to let page render
    const timer = setTimeout(() => setCurrentStep(0), 800);
    return () => clearTimeout(timer);
  }, []);

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

  if (currentStep < 0) return null;

  const mark = COACHMARKS[currentStep];

  return (
    <Popover open={true}>
      <PopoverAnchor asChild>
        <span
          ref={(el) => {
            if (!el) return;
            const target = document.getElementById(mark.targetId);
            if (target) {
              const rect = target.getBoundingClientRect();
              const scrollY = window.scrollY;
              el.style.position = 'absolute';
              el.style.top = `${rect.bottom + scrollY + 4}px`;
              el.style.left = `${rect.left + rect.width / 2}px`;
              el.style.width = '1px';
              el.style.height = '1px';
              // Scroll into view
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      </PopoverAnchor>
      <AnimatePresence mode="wait">
        <PopoverContent
          key={currentStep}
          side="bottom"
          align="center"
          className="w-72 p-0 border-primary/30 shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="p-4"
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
        </PopoverContent>
      </AnimatePresence>
    </Popover>
  );
};

export default Coachmarks;
