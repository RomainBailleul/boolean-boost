import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true);
      }
    });

    // Check URL hash for recovery token
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setRecoveryReady(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Mot de passe mis à jour !', description: 'Vous pouvez maintenant vous connecter.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Une erreur est survenue.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-6 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Mot de passe réinitialisé</h1>
          <p className="text-muted-foreground">Votre mot de passe a été mis à jour avec succès.</p>
          <Button onClick={() => navigate('/')} className="rounded-xl">Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  if (!recoveryReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Vérification du lien de réinitialisation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <KeyRound className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground">Entrez votre nouveau mot de passe ci-dessous.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} className="rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} className="rounded-lg" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 font-semibold">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Réinitialiser le mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
