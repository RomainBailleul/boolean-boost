import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { ArrowLeft, BarChart3, Users, Bookmark, Layers, Globe, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUserRole } from '@/hooks/useUserRole';
import AuthModal from '@/components/AuthModal';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(260 60% 55%)',
  'hsl(190 70% 50%)',
  'hsl(30 80% 55%)',
];

const PLATFORM_LABELS: Record<string, string> = {
  'sales-navigator': 'Sales Navigator',
  'linkedin': 'LinkedIn',
  'google-xray': 'Google X-Ray',
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading: boolean;
}> = ({ icon, label, value, loading }) => (
  <Card className="glass-card border-border/50">
    <CardContent className="flex items-center gap-4 p-5">
      <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user);
  const stats = useDashboardStats(user);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-hero)' }} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="rounded-lg">
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Générateur</Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              <span className="gradient-text">Dashboard</span>
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Empty state for unauthenticated users */}
        {!authLoading && !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-2xl bg-primary/10 p-5 mb-6">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Connectez-vous pour suivre vos requêtes et sauvegardes
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Accédez à vos statistiques personnelles, votre historique et vos requêtes sauvegardées en créant un compte gratuit.
            </p>
            <Button onClick={() => setAuthOpen(true)} className="glow-button rounded-xl h-11 px-6 font-semibold">
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Button>
            <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
          </motion.div>
        ) : (
          <>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-3 sm:gap-4 mb-8`}
        >
          {isAdmin && (
            <>
              <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Requêtes générées" value={stats.totalQueries} loading={stats.loading || roleLoading} />
              <StatCard icon={<Users className="w-5 h-5" />} label="Titres utilisés" value={stats.totalTitles.toLocaleString()} loading={stats.loading || roleLoading} />
            </>
          )}
          <StatCard icon={<Layers className="w-5 h-5" />} label="Mes requêtes" value={user ? stats.myQueries : '—'} loading={stats.loading || roleLoading} />
          <StatCard icon={<Bookmark className="w-5 h-5" />} label="Mes sauvegardes" value={user ? stats.mySavedQueries : '—'} loading={stats.loading || roleLoading} />
        </motion.div>

        {/* Admin-only charts section */}
        {isAdmin && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Activity chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Activité (30 derniers jours)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.loading ? (
                    <Skeleton className="h-48 w-full rounded-lg" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.dailyCounts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                        <RTooltip
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: 12,
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Requêtes" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top categories pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Catégories les plus utilisées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.loading ? (
                    <Skeleton className="h-48 w-full rounded-lg" />
                  ) : stats.topCategories.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Aucune donnée encore
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.topCategories}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={35}
                          >
                            {stats.topCategories.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RTooltip
                            contentStyle={{
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: 12,
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5">
                        {stats.topCategories.map((cat, i) => (
                          <div key={cat.name} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="capitalize text-foreground font-medium truncate">{cat.name}</span>
                            <span className="text-muted-foreground ml-auto">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Admin-only Platforms section */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Plateformes utilisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <Skeleton className="h-12 w-full rounded-lg" />
                ) : stats.topPlatforms.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucune donnée encore</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {stats.topPlatforms.map((p) => (
                      <div key={p.name} className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5">
                        <span className="text-sm font-semibold text-foreground">{PLATFORM_LABELS[p.name] || p.name}</span>
                        <span className="text-xs text-muted-foreground bg-background/50 rounded-full px-2 py-0.5">{p.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <footer className="mt-12 text-center border-t border-border pt-6 pb-4">
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="font-semibold text-primary hover:underline">← Retour au générateur</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
