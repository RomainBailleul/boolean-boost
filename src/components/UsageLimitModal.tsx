import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, Clock } from 'lucide-react';

interface UsageLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  remaining: number;
  limit: number;
  onLogin: () => void;
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  open, onOpenChange, isAuthenticated, remaining, limit, onLogin,
}) => {
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  const hoursLeft = Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <div className="mx-auto mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Lock className="w-10 h-10 text-primary mx-auto" />
            </motion.div>
          </div>
          <DialogTitle className="text-lg">Limite atteinte</DialogTitle>
          <DialogDescription className="text-sm">
            Vous avez utilisé vos <span className="font-bold text-foreground">{limit} requêtes</span> du jour.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
          <Clock className="w-3.5 h-3.5" />
          Rechargement dans ~{hoursLeft}h
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Créez un compte gratuit pour passer à <span className="font-bold text-foreground">20 requêtes/jour</span> !
            </p>
            <Button onClick={onLogin} className="w-full rounded-xl h-11 font-bold">
              <UserPlus className="w-4 h-4 mr-2" />
              Créer un compte gratuit
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-xs">
              Revenir plus tard
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Votre quota de {limit} requêtes/jour sera rechargé demain.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl">
              Compris
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UsageLimitModal;
