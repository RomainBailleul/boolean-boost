import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, Bookmark, Layers, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { downloadCsv } from '@/utils/csvExport';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';

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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = useDashboardStats(user);

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Requêtes générées" value={stats.totalQueries} loading={stats.loading} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Titres utilisés" value={stats.totalTitles.toLocaleString()} loading={stats.loading} />
        <StatCard icon={<Layers className="w-5 h-5" />} label="Mes requêtes" value={stats.myQueries} loading={stats.loading} />
        <StatCard icon={<Bookmark className="w-5 h-5" />} label="Mes sauvegardes" value={stats.mySavedQueries} loading={stats.loading} />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
