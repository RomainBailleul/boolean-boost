import { useEffect } from 'react';

interface ShortcutHandlers {
  onNext?: () => void;
  onBack?: () => void;
  onCopy?: () => void;
}

export const useKeyboardShortcuts = ({ onNext, onBack, onCopy }: ShortcutHandlers) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Enter → next step
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onNext?.();
        return;
      }

      // Escape → go back
      if (e.key === 'Escape') {
        onBack?.();
        return;
      }

      // Ctrl/Cmd + C on step 3 (when no text selected)
      if (mod && e.key === 'c' && onCopy) {
        const sel = window.getSelection();
        if (!sel || sel.toString().length === 0) {
          e.preventDefault();
          onCopy();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onBack, onCopy]);
};
