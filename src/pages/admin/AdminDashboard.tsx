import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Bookmark, Layers, Download, UserCheck, UserPlus, SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { downloadCsv } from '@/utils/csvExport';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface FeedbackStats {
  total: number;
  perfect: number;
  useful: number;
  not_useful: number;
}

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  weeklySignups: Array<{ week: string; count: number }>;
  loading: boolean;
  feedback: FeedbackStats;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = useDashboardStats(user);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    activeToday: 0,
    weeklySignups: [],
    loading: true,
    feedback: { total: 0, perfect: 0, useful: 0, not_useful: 0 },
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/admin-stats`;
        const session = (await supabase.auth.getSession()).data.session;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });

        // Fetch feedback stats
        const { data: feedbackData } = await supabase
          .from('feedback_responses' as any)
          .select('rating');

        const fb: FeedbackStats = { total: 0, perfect: 0, useful: 0, not_useful: 0 };
        if (feedbackData) {
          fb.total = feedbackData.length;
          feedbackData.forEach((r: any) => {
            if (r.rating === 'perfect') fb.perfect++;
            else if (r.rating === 'useful') fb.useful++;
            else if (r.rating === 'not_useful') fb.not_useful++;
          });
        }

        if (res.ok) {
          const data = await res.json();
          setAdminStats({
            totalUsers: data.totalUsers || 0,
            activeToday: data.activeToday || 0,
            weeklySignups: data.weeklySignups || [],
            loading: false,
            feedback: fb,
          });
        } else {
          setAdminStats((prev) => ({ ...prev, loading: false, feedback: fb }));
        }
      } catch {
        setAdminStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          <span className="gradient-text">Dashboard Admin</span>
        </h1>
        <Button
          variant="outline"
          size="sm"
          disabled={stats.loading}
          onClick={() => {
            downloadCsv(
              stats.dailyCounts.map((d) => ({ date: d.date, requêtes: d.count })),
              `activite-${new Date().toISOString().slice(0, 10)}.csv`,
            );
            toast.success('Export CSV téléchargé');
          }}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Exporter CSV
        </Button>
      </div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4"
      >
        <StatCard icon={<Users className="w-5 h-5" />} label="Utilisateurs inscrits" value={adminStats.totalUsers.toLocaleString()} loading={adminStats.loading} />
        <StatCard icon={<UserCheck className="w-5 h-5" />} label="Actifs aujourd'hui" value={adminStats.activeToday} loading={adminStats.loading} />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Requêtes générées" value={stats.totalQueries} loading={stats.loading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8"
      >
        <StatCard icon={<UserPlus className="w-5 h-5" />} label="Titres utilisés" value={stats.totalTitles.toLocaleString()} loading={stats.loading} />
        <StatCard icon={<Layers className="w-5 h-5" />} label="Mes requêtes" value={stats.myQueries} loading={stats.loading} />
        <StatCard icon={<Bookmark className="w-5 h-5" />} label="Mes sauvegardes" value={stats.mySavedQueries} loading={stats.loading} />
      </motion.div>

      {/* Daily activity chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <Card className="glass-card border-border/50">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Requêtes par jour (30 derniers jours)
            </h2>
            {stats.loading ? (
              <Skeleton className="h-48 w-full" />
            ) : stats.dailyCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.dailyCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="count" name="Requêtes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly signups chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card border-border/50">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Inscriptions par semaine (12 dernières semaines)
            </h2>
            {adminStats.loading ? (
              <Skeleton className="h-48 w-full" />
            ) : adminStats.weeklySignups.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={adminStats.weeklySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    labelFormatter={(l) => `Semaine du ${l}`}
                  />
                  <Bar dataKey="count" name="Inscriptions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
