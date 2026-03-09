import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: 'Email envoyé !', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Connecté !', description: 'Bienvenue sur Boolean Boost.' });
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: 'Inscription réussie !', description: 'Vérifiez votre email pour confirmer votre compte.' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Une erreur est survenue.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.com" required className="rounded-lg" />
          </div>
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="auth-password">Mot de passe</Label>
              <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className="rounded-lg" />
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full glow-button rounded-xl h-11 font-semibold">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4 mr-2" />
            ) : mode === 'signup' ? (
              <UserPlus className="w-4 h-4 mr-2" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            {mode === 'login' ? 'Se connecter' : mode === 'signup' ? "S'inscrire" : 'Envoyer le lien'}
          </Button>
          {mode === 'login' && (
            <p className="text-center">
              <button type="button" onClick={() => setMode('reset')} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p className="text-center">
              <button type="button" onClick={() => setMode('login')} className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Retour à la connexion
              </button>
            </p>
          )}
          {mode !== 'reset' && (
            <p className="text-center text-xs text-muted-foreground">
              {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary font-semibold hover:underline">
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
