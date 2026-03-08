import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.com" required className="rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Mot de passe</Label>
            <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} className="rounded-lg" />
          </div>
          <Button type="submit" disabled={loading} className="w-full glow-button rounded-xl h-11 font-semibold">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
