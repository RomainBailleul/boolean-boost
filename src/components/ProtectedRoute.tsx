import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!loading && !user && !toastShown.current) {
      toastShown.current = true;
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour accéder au dashboard.',
        variant: 'destructive',
      });
    }
  }, [loading, user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/?auth=required" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
